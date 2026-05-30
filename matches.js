export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const PANDASCORE_API_TOKEN = process.env.PANDASCORE_KEY;

    if (!PANDASCORE_API_TOKEN) {
        return res.status(500).json({ error: "Missing PANDASCORE_KEY secret." });
    }

    try {
        // We hit the /past endpoint to get analytics scores of completed matches
        const response = await fetch('https://api.pandascore.co/matches/past?sort=-end_at&page[size]=5', {
            headers: {
                'Authorization': `Bearer ${PANDASCORE_API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`PandaScore error: ${response.status}`);
        const rawData = await response.json();

        const analyticsOutput = rawData.map(match => {
            const teamA = match.opponents[0]?.opponent?.name || "Unknown Team";
            const teamB = match.opponents[1]?.opponent?.name || "Unknown Team";
            
            const teamA_Id = match.opponents[0]?.opponent?.id;
            const teamB_Id = match.opponents[1]?.opponent?.id;

            // Extract exact game score strings (e.g. "2 - 1")
            const scoreA = match.results[0]?.score ?? 0;
            const scoreB = match.results[1]?.score ?? 0;

            return {
                id: match.id,
                game: match.videogame ? match.videogame.name : "Esports",
                tournament: match.league?.name || "Pro Tournament",
                teamA: teamA,
                teamB: teamB,
                teamA_Id: teamA_Id,
                teamB_Id: teamB_Id,
                winnerId: match.winner_id,
                score: `${scoreA} : ${scoreB}`
            };
        });

        return res.status(200).json(analyticsOutput);
    } catch (error) {
        return res.status(500).json({ error: "Failed to compile analytical data feeds." });
    }
}
