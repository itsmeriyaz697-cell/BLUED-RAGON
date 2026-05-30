const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Enables cross-origin resource data sharing for index.html

// ⚠️ Replace this string value with your secret dashboard token from pandascore.co
const PANDASCORE_API_TOKEN = 'YOUR_PANDASCORE_API_KEY_HERE'; 

app.get('/api/matches', async (req, res) => {
    try {
        const response = await fetch('https://api.pandascore.co/matches/upcoming?sort=begin_at&page[size]=5', {
            headers: {
                'Authorization': `Bearer ${PANDASCORE_API_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`PandaScore replied with status: ${response.status}`);
        const rawData = await response.json();

        // Translate the API's objects into the structure our clean UI uses
        const cleanMatches = rawData.map(match => {
            const teamA = match.opponents[0]?.opponent?.name || "TBD";
            const teamB = match.opponents[1]?.opponent?.name || "TBD";
            const matchDate = new Date(match.begin_at).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
            });

            return {
                id: match.id,
                game: match.videogame ? match.videogame.name : "Esports Match",
                teamA: teamA,
                teamB: teamB,
                status: match.status === 'running' ? 'live' : 'upcoming',
                time: match.status === 'running' ? 'LIVE NOW' : matchDate,
                streamUrl: match.live?.url || "https://twitch.tv"
            };
        });

        res.json(cleanMatches);
    } catch (error) {
        console.error("Pipeline server fetch crash:", error);
        res.status(500).json({ error: "Failed to grab live esports matches" });
    }
});

app.listen(3000, () => console.log('🚀 Server listening and ready on http://localhost:3000'));
