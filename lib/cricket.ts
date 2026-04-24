import 'server-only';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const CRICKET_API_KEY = process.env.CRICKET_API_KEY;

const HEADERS = {
  'X-RapidAPI-Key': RAPIDAPI_KEY || '',
  'X-RapidAPI-Host': RAPIDAPI_HOST || '',
  'x-api-key': RAPIDAPI_KEY || '',
  'x-api-host': RAPIDAPI_HOST || '',
};

export async function getLiveCricketScores() {
  if (!RAPIDAPI_KEY) return [];

  try {
    // Fetch live, upcoming, and recent concurrently for a full 360-degree scoreboard
    const [liveRes, upcomingRes, recentRes] = await Promise.all([
      fetch(`https://${RAPIDAPI_HOST}/matches/v1/live`, { headers: HEADERS, next: { revalidate: 60 } }),
      fetch(`https://${RAPIDAPI_HOST}/matches/v1/upcoming`, { headers: HEADERS, next: { revalidate: 300 } }),
      fetch(`https://${RAPIDAPI_HOST}/matches/v1/recent`, { headers: HEADERS, next: { revalidate: 120 } })
    ]);

    const liveData = liveRes.ok ? await liveRes.json() : null;
    const upcomingData = upcomingRes.ok ? await upcomingRes.json() : null;
    const recentData = recentRes.ok ? await recentRes.json() : null;

    let allTypeMatches = [];
    if (liveData?.typeMatches) allTypeMatches.push(...liveData.typeMatches);
    if (upcomingData?.typeMatches) allTypeMatches.push(...upcomingData.typeMatches);
    if (recentData?.typeMatches) allTypeMatches.push(...recentData.typeMatches);

    if (allTypeMatches.length === 0) {
      // Final fallback to CricketData.org if RapidAPI is completely empty/blocked
      return await getCricApiFallback();
    }

    return mapCricbuzzData(allTypeMatches);
  } catch (error) {
    console.error('[CricbuzzAPI] Fetch error:', error);
    return await getCricApiFallback();
  }
}

async function getCricApiFallback() {
  if (!CRICKET_API_KEY) return [];
  try {
    const response = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${CRICKET_API_KEY}`, {
       next: { revalidate: 60 }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.status === 'success') {
        return mapCricApiData(data.data);
      }
    }
  } catch (err) {
    console.error('[CricketDataAPI] Fallback failed:', err);
  }
  return [];
}

function mapCricbuzzData(typeMatches: any[]) {
  const flattened: any[] = [];
  typeMatches.forEach((group: any) => {
    if (!group.seriesMatches) return;
    group.seriesMatches.forEach((series: any) => {
      if (!series.seriesAdWrapper) return;
      series.seriesAdWrapper.matches.forEach((m: any) => {
        const matchInfo = m.matchInfo;
        const matchScore = m.matchScore;
        const isLive = matchInfo.state === 'In Progress' || matchInfo.state === 'Live';
        const isUpcoming = matchInfo.state === 'Upcoming' || matchInfo.state === 'Preview';
        const isFinished = matchInfo.state === 'Complete' || matchInfo.state === 'Result';
        const team1 = matchInfo.team1;
        const team2 = matchInfo.team2;
        const t1Score = matchScore?.team1Score?.inngs1;
        const t2Score = matchScore?.team2Score?.inngs1;

        const seriesName = (matchInfo.seriesName || '').toLowerCase();
        const t1 = (team1.teamName || '').toLowerCase();
        const t2 = (team2.teamName || '').toLowerCase();
        
        const isIPL = seriesName.includes('ipl') || 
                      seriesName.includes('indian premier league') || 
                      seriesName.includes('tata ipl') ||
                      seriesName.includes('t20 league') ||
                      // Fallback: If both teams are IPL teams, it's an IPL match
                      ((t1.includes('chennai') || t1.includes('csk') || t1.includes('mumbai') || t1.includes('mi') || t1.includes('rcb') || t1.includes('bangalore') || t1.includes('kolkata') || t1.includes('kkr') || t1.includes('rajasthan') || t1.includes('rr') || t1.includes('hyderabad') || t1.includes('srh') || t1.includes('delhi') || t1.includes('dc') || t1.includes('lucknow') || t1.includes('lsg') || t1.includes('gujarat') || t1.includes('gt') || t1.includes('punjab') || t1.includes('pbks')) &&
                       (t2.includes('chennai') || t2.includes('csk') || t2.includes('mumbai') || t2.includes('mi') || t2.includes('rcb') || t2.includes('bangalore') || t2.includes('kolkata') || t2.includes('kkr') || t2.includes('rajasthan') || t2.includes('rr') || t2.includes('hyderabad') || t2.includes('srh') || t2.includes('delhi') || t2.includes('dc') || t2.includes('lucknow') || t2.includes('lsg') || t2.includes('gujarat') || t2.includes('gt') || t2.includes('punjab') || t2.includes('pbks')));

        flattened.push({
          id: matchInfo.matchId.toString(),
          status: isLive ? 'LIVE' : (isUpcoming ? 'UPCOMING' : 'PREVIOUS'),
          isIPL: isIPL,
          matchNo: matchInfo.matchDesc,
          date: new Date(Number(matchInfo.startDate)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          time: new Date(Number(matchInfo.startDate)).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          venue: matchInfo.venueInfo?.ground || 'Stadium',
          team1: {
            name: team1.teamName,
            nameEn: team1.teamName,
            score: t1Score ? `${t1Score.runs}/${t1Score.wickets}` : '0/0',
            overs: t1Score ? t1Score.overs.toString() : '0',
            color: getTeamColor(team1.teamName)
          },
          team2: {
            name: team2.teamName,
            nameEn: team2.teamName,
            score: t2Score ? `${t2Score.runs}/${t2Score.wickets}` : '0/0',
            overs: t2Score ? t2Score.overs.toString() : '0',
            color: getTeamColor(team2.teamName)
          },
          result: matchInfo.status || 'Match Scheduled',
          resultEn: matchInfo.status || 'Match Scheduled'
        });
      });
    });
  });
  return sortMatches(flattened);
}

function mapCricApiData(data: any[]) {
  return sortMatches(data.map((match: any, index: number) => {
    const isLive = match.matchStarted && !match.matchEnded;
    const isUpcoming = !match.matchStarted;
    return {
      id: match.id,
      status: isLive ? 'LIVE' : (isUpcoming ? 'UPCOMING' : 'PREVIOUS'),
      isIPL: match.name.toLowerCase().includes('ipl') || match.name.toLowerCase().includes('indian premier league'),
      matchNo: index + 1,
      date: match.date,
      time: 'Check Schedule',
      venue: match.venue || 'Stadium',
      team1: { 
         name: match.teams[0], 
         nameEn: match.teams[0], 
         score: match.score?.[0]?.r ? `${match.score[0].r}/${match.score[0].w}` : '0/0',
         overs: match.score?.[0]?.o ? String(match.score[0].o) : '0',
         color: getTeamColor(match.teams[0]) 
      },
      team2: { 
         name: match.teams[1], 
         nameEn: match.teams[1], 
         score: match.score?.[1]?.r ? `${match.score[1].r}/${match.score[1].w}` : '0/0',
         overs: match.score?.[1]?.o ? String(match.score[1].o) : '0',
         color: getTeamColor(match.teams[1])
      },
      result: match.status,
      resultEn: match.status
    };
  }));
}

function sortMatches(matches: any[]) {
  // Filter for ONLY IPL matches as requested
  const iplOnly = matches.filter(m => m.isIPL);

  return iplOnly.sort((a: any, b: any) => {
    // Then prioritize LIVE matches
    if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
    if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
    
    // Then UPCOMING matches
    if (a.status === 'UPCOMING' && b.status === 'PREVIOUS') return -1;
    if (a.status === 'PREVIOUS' && b.status === 'UPCOMING') return 1;
    
    return 0;
  }).slice(0, 15);
}

function getTeamColor(name: string) {
  const n = (name || '').toLowerCase();
  if (n.includes('chennai') || n.includes('csk')) return '#FFFF00';
  if (n.includes('mumbai') || n.includes('mi')) return '#004BA0';
  if (n.includes('rcb') || n.includes('bangalore')) return '#CC0000';
  if (n.includes('kolkata') || n.includes('kkr')) return '#2E0854';
  if (n.includes('rajasthan') || n.includes('rr')) return '#FF4081';
  if (n.includes('hyderabad') || n.includes('srh')) return '#FF8200';
  if (n.includes('delhi') || n.includes('dc')) return '#00008B';
  if (n.includes('lucknow') || n.includes('lsg')) return '#00E5FF';
  if (n.includes('gujarat') || n.includes('gt')) return '#1B2133';
  if (n.includes('punjab') || n.includes('pbks')) return '#ED1F27';
  return '#1a367c';
}
