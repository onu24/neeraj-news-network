'use server';

import { getMongoDb } from '@/lib/mongodb';
import { JobOpening, JobApplication } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function getJobOpenings(activeOnly = false): Promise<JobOpening[]> {
  try {
    const db = await getMongoDb();
    const query = activeOnly ? { isActive: true } : {};
    
    const jobs = await db
      .collection('jobOpenings')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return jobs.map(job => ({
      id: job._id.toString(),
      _id: job._id.toString(),
      title: job.title || '',
      slug: job.slug || '',
      location: job.location || '',
      type: job.type || '',
      description: job.description || '',
      isActive: job.isActive ?? true,
      createdAt: job.createdAt || new Date().toISOString(),
      updatedAt: job.updatedAt || new Date().toISOString(),
    })) as JobOpening[];
  } catch (error) {
    console.error('Failed to fetch job openings:', error);
    return [];
  }
}

export async function getJobOpening(idOrSlug: string): Promise<JobOpening | null> {
  try {
    const db = await getMongoDb();
    
    let query: any = { slug: idOrSlug };
    if (ObjectId.isValid(idOrSlug)) {
      query = { $or: [{ _id: new ObjectId(idOrSlug) }, { slug: idOrSlug }] };
    }

    const job = await db.collection('jobOpenings').findOne(query);
    if (!job) return null;

    return {
      id: job._id.toString(),
      _id: job._id.toString(),
      title: job.title || '',
      slug: job.slug || '',
      location: job.location || '',
      type: job.type || '',
      description: job.description || '',
      isActive: job.isActive ?? true,
      createdAt: job.createdAt || new Date().toISOString(),
      updatedAt: job.updatedAt || new Date().toISOString(),
    } as JobOpening;
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return null;
  }
}

export async function createJobOpening(data: Partial<JobOpening>) {
  try {
    const db = await getMongoDb();
    const slug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    
    const newJob = {
      ...data,
      slug,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection('jobOpenings').insertOne(newJob);
    revalidatePath('/careers');
    revalidatePath('/admin/careers');
    
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error('Failed to create job:', error);
    return { success: false, error: 'Failed to create job' };
  }
}

export async function updateJobOpening(id: string, data: Partial<JobOpening>) {
  try {
    const db = await getMongoDb();
    
    const updateData = { ...data };
    delete updateData.id;
    delete (updateData as any)._id;
    updateData.updatedAt = new Date().toISOString();

    await db.collection('jobOpenings').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    revalidatePath('/careers');
    revalidatePath(`/careers/${data.slug || ''}`);
    revalidatePath('/admin/careers');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update job:', error);
    return { success: false, error: 'Failed to update job' };
  }
}

export async function deleteJobOpening(id: string) {
  try {
    const db = await getMongoDb();
    await db.collection('jobOpenings').deleteOne({ _id: new ObjectId(id) });
    
    revalidatePath('/careers');
    revalidatePath('/admin/careers');
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete job:', error);
    return { success: false, error: 'Failed to delete job' };
  }
}

// Mail utility
import { sendMail } from '@/lib/mail';
import cloudinary from '@/lib/cloudinary';

export async function submitApplication(formData: FormData) {
  try {
    const jobId = formData.get('jobId') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const applicantName = formData.get('applicantName') as string;
    const applicantEmail = formData.get('applicantEmail') as string;
    const applicantPhone = formData.get('applicantPhone') as string;
    const coverLetter = formData.get('coverLetter') as string;
    const resumeFile = formData.get('resume') as File;

    if (!resumeFile) {
      return { success: false, error: 'Resume file is required' };
    }

    // Read file buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Local Storage instead of Cloudinary
    const fs = require('fs/promises');
    const path = require('path');
    
    const extension = resumeFile.name.split('.').pop()?.toLowerCase();
    const fileNameWithoutExt = resumeFile.name.replace(/\.[^/.]+$/, "");
    const safeFileName = `${Date.now()}-${fileNameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
    
    // Save to public/uploads/resumes
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    const filePath = path.join(uploadDir, safeFileName);
    const resumeUrl = `/uploads/resumes/${safeFileName}`;
    
    await fs.writeFile(filePath, buffer);

    const application = {
      jobId,
      jobTitle,
      applicantName,
      applicantEmail,
      applicantPhone,
      coverLetter,
      resumeUrl,
      createdAt: new Date().toISOString(),
    };

    // Save to MongoDB
    const db = await getMongoDb();
    await db.collection('jobApplications').insertOne(application);

    // Send Email via Nodemailer
    if (process.env.SMTP_USER) {
      const mailOptions = {
        from: `"Drishyam Careers" <${process.env.SMTP_USER}>`,
        to: process.env.CAREERS_EMAIL || 'careers@drishyamnews.in',
        subject: `New Job Application: ${jobTitle} - ${applicantName}`,
        text: `
New Application Received:

Job: ${jobTitle}
Applicant: ${applicantName}
Email: ${applicantEmail}
Phone: ${applicantPhone}

Cover Letter:
${coverLetter}

Resume is attached and also available at: ${resumeUrl}
        `,
        attachments: [
          {
            filename: resumeFile.name,
            content: buffer,
          },
        ],
      };

      await sendMail(mailOptions);
    } else {
      console.warn('SMTP_USER not configured. Application saved but email not sent.');
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to submit application:', error);
    return { success: false, error: 'Failed to submit application' };
  }
}

export async function getJobApplications(jobId?: string): Promise<JobApplication[]> {
  try {
    const db = await getMongoDb();
    const query = jobId ? { jobId } : {};
    
    const applications = await db
      .collection('jobApplications')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return applications.map(app => ({
      id: app._id.toString(),
      _id: app._id.toString(),
      jobId: app.jobId || '',
      jobTitle: app.jobTitle || '',
      applicantName: app.applicantName || '',
      applicantEmail: app.applicantEmail || '',
      applicantPhone: app.applicantPhone || '',
      coverLetter: app.coverLetter || '',
      resumeUrl: app.resumeUrl || '',
      createdAt: app.createdAt || new Date().toISOString(),
    })) as JobApplication[];
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return [];
  }
}

