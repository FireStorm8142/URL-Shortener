import { useState } from 'react';
import './App.css';

function Sidebar({ Active, setActive, shortUrl, handleStats }) {
	return(
		<div className='sidebar-content'>
			<div className={`sidebar-item ${Active === "shorten" ? "Active" : ""}`} onClick={()=>setActive("shorten")}>🔗 Shorten Link
			</div>
			<div className={`sidebar-item ${Active === "stats" ? "Active" : ""}`} onClick={()=>{setActive("stats");
			if (shortUrl) {
				const code = shortUrl.split("/").pop()
				handleStats(code)();
				}
			}}>📊 Stats
			</div>
		</div>
	)
}

function Shorten({ Url, setUrl, customCode, setCustomCode, shortUrl, setShortUrl, handleSubmit }) {
	return(
		<div className="card">
			<h1>Paste Link Here</h1>

			<input
				type="text"
				placeholder="Enter your URL"
				value={Url}
				onChange={(e) => setUrl(e.target.value)}
				required
			/>
			<input
				type="text"
				placeholder="Custom code (optional)"
				value={customCode}
				onChange={(e) => setCustomCode(e.target.value)}
			/>
			<button onClick={handleSubmit}>Shorten</button>

			{shortUrl && (
				<div className="result">
					<a href={shortUrl} target="_blank" rel="noreferrer">
						{shortUrl}
					</a>
					<button	className="copy-btn" onClick={() => navigator.clipboard.writeText(shortUrl)}>
						Copy
					</button>
				</div>
			)}
		</div>
	)
}

function Stats({ statsCode, shortUrl, setStatsCode, statsData, handleStats }) {
	const uniqueVisitors = new Set(statsData?.events?.map(event => event.ip)).size;
	const lastClick = statsData?.events?.[0].timestamp || "N/A";
	return(
		<div className='stats-container'>
			<div className='stats-search'>
				<input type="text" placeholder="Enter Short Code" value={statsCode} onChange={(e) => setStatsCode(e.target.value) }/>
				<button onClick={() => handleStats(statsCode)()}>Get Stats</button>
			</div>
			<div className='stats-page'>
				<div className='info'>
					<div className='dashboard'>
						<div id='summary'>Summary</div>
						<div className='summarysection'>
							<h1 className='summaryrow'>Total Clicks: {statsData?.total_clicks || 0}</h1>
							<h1 className='summaryrow'>Unique Visitors: {uniqueVisitors}</h1>
							<h1 className='summaryrow'>Last Click: {lastClick}</h1>
						</div>
					</div>
					<div className='detailed-stats'> 
						<div id='info'>Info</div>
						<div className='inforow'>Original URL: {statsData?.original_url || "N/A"}</div>
						<div className='inforow'>Short URL: {shortUrl? shortUrl : "N/A"}</div>
						<div className='inforow'>Created On: {statsData?.created || "N/A"}</div>
					</div>
				</div>
				<div className='stats'>
					<div id = 'stats-header'>Click Events</div>
					{statsData?.events?.map((event, index) => (
					<div className='stat-row' key={index}>
						<span className='ip'>{event.ip}</span>

						<span className='meta'>{event.referrer || "Direct"}</span>

						<span className='time'>{event.timestamp}</span>
					</div>
				))}
				</div>
			</div>
		</div>
	)
}

function App() {
	const [Active, setActive] = useState("shorten");
	const [Url, setUrl] = useState("");
	const [customCode, setCustomCode] = useState("");
	const [statsCode, setStatsCode] = useState("");
	const [shortUrl, setShortUrl] = useState("");
	const [statsData, setStatsData] = useState("");

	const handleSubmit = async () => {
		const res = await fetch("http://127.0.0.1:8000/shorten", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			url: Url,
			custom_code: customCode || null,
		}),
		});
		const data = await res.json();
		setShortUrl(`http://127.0.0.1:8000/${data.short}`)
	};

	const handleStats = (code) => async () => {
		const res = await fetch (`http://127.0.0.1:8000/stats/${code}`);
		const data = await res.json();
		setStatsData(data);
	}

	return (
    <div className="App">
		<div className="sidebar">
			<div id='block'></div>
			<Sidebar Active={Active} setActive={setActive} shortUrl={shortUrl} handleStats={handleStats} />
		</div>
		<div className="container">
			{Active === "shorten" && <Shorten Url={Url} setUrl={setUrl} customCode={customCode} setCustomCode={setCustomCode} shortUrl={shortUrl} setShortUrl={setShortUrl} handleSubmit={handleSubmit} />}
			{Active === "stats" && <Stats statsCode={statsCode} shortUrl={shortUrl} setStatsCode={setStatsCode} statsData={statsData} handleStats={handleStats} />}
		</div>
    </div>
  	);
}

export default App;
