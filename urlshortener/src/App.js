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

function Shorten({ Url, setUrl, customCode, setCustomCode, shortUrl, handleSubmit, error}) {
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
			{error && <div className="error">{error}</div>}
		</div>
	)
}

function Stats({ statsCode, setStatsCode, statsData, handleStats }) {
	const uniqueVisitors = new Set(statsData?.events?.map(event => event.ip)).size;
	const formatTime = (timestamp) => {
		return new Date(timestamp).toLocaleString("en-US", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: false
		});
	};
	const lastClick = statsData?.events?.at(-1)?.timestamp ? formatTime(statsData.events.at(-1).timestamp) : "N/A";
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
					<div className='details'> 
						<div id='info'>Info</div>
						<div className='infosection'>
							<div className='inforow'>Original URL: {statsData?.original_url || "N/A"}</div>
							<div className='inforow'>Short URL: {statsData?.short_url || "N/A"}</div>
							<div className='inforow'>Created On: {statsData?.created ? formatTime(statsData.created) : "N/A"}</div>
						</div>
					</div>
				</div>
				<div className='stats'>
					<div id = 'stats-header'>Click Events</div>
					<div className="stats-header">
						<span>IP Address</span>
						<span>Referrer</span>
						<span>Time</span>
					</div> 
					{statsData?.events?.map((event, index) => (
					<div className='stat-row' key={index}>
						<span className='ip'>{event.ip}</span>
						<span className='meta'>{event.referrer || "Direct"}</span>
						<span className='time'>{formatTime(event.timestamp)}</span>
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
	const [error, setError] = useState("");

	const handleSubmit = async () => {
		setError("");
		setShortUrl("");
		try {
			const res = await fetch((`${process.env.REACT_APP_API_URL}/shorten`), {
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
			if (res.status === 422){
				throw new Error("Invalid URL Format, Enter a valid URL");
			}
			if (!res.ok){
				throw new Error(data.detail);
			}
			setShortUrl(`${process.env.REACT_APP_API_URL}/${data.short}`)
		} catch (error) {
			setError(error.message);
		}
	};

	const handleStats = (code) => async () => {
		setError("");
		setStatsData("");
		try{
			const res = await fetch (`${process.env.REACT_APP_API_URL}/stats/${code}`);
			const data = await res.json();
			if (!res.ok){
				throw new Error(data.detail);
			}
			setStatsData(data);
		} catch (error) {
			setError(error.message);
		}
	}

	return (
    <div className="App">
		<div className="sidebar">
			<div id='block'></div>
			<Sidebar Active={Active} setActive={setActive} shortUrl={shortUrl} handleStats={handleStats} />
		</div>
		<div className="container">
			{Active === "shorten" && <Shorten Url={Url} setUrl={setUrl} customCode={customCode} setCustomCode={setCustomCode} shortUrl={shortUrl} handleSubmit={handleSubmit} error={error} />}
			{Active === "stats" && <Stats statsCode={statsCode} setStatsCode={setStatsCode} statsData={statsData} handleStats={handleStats} />}
		</div>
    </div>
  	);
}

export default App;
