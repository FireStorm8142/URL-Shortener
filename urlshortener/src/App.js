import { useState } from 'react';
import './App.css';

function App() {
	const [Active, setActive] = useState("shorten");
	const [Url, setUrl] = useState("");
	const [customCode, setCustomCode] = useState("");
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

	function Sidebar(){
		return(
			<div className='sidebar-content'>
				<div className={`sidebar-item ${Active === "shorten" ? "Active" : ""}`} onClick={()=>setActive("shorten")}>🔗Shorten
				</div>
				<div className={`sidebar-item ${Active === "stats" ? "Active" : ""}`} onClick={()=>{setActive("stats");
				if (shortUrl) {
					const code = shortUrl.split("/").pop()
					handleStats(code);
					}
				}}>📊Stats
				</div>
			</div>
		)
	}

	function Shorten(){
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
								<button
									className="copy-btn"
									onClick={() => navigator.clipboard.writeText(shortUrl)}
								>
									Copy
								</button>
							</div>
						)}
			</div>
		)
	}

	function Stats(){
		return(
			<div className='stats-page'>
				<div className='dashboard'>
					<h1 className='totalclicks'>{statsData?.total_clicks || 0}</h1>
				</div>
				<div className='stats'>
					{statsData?.events?.map((event, index) => (
					<div className='stat-row' key={index}>

						<div className='stat-main'>
							<span className='ip'>{event.ip}</span>

							<span className='meta'>
								{event.referrer || "Direct"}
							</span>
						</div>
						<span className='time'>
							{event.timestamp}
						</span>
					</div>
				))}
				</div>
			</div>
		)
	}

	return (
    <div className="App">
		<div className="sidebar">
			<div id='block'></div>
			<Sidebar></Sidebar>
		</div>
			<div className="container">
				{Active === "shorten" && <Shorten></Shorten>}
				{Active === "stats" && <Stats></Stats>}
			</div>
    </div>
  	);
}

export default App;
