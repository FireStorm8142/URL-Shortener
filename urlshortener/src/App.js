import { useState } from 'react';
import './App.css';

function App() {
	const [Active, setActive] = useState("shorten");
	const [Url, setUrl] = useState("");
	const [customCode, setCustomCode] = useState("");
	const [shortUrl, setShortUrl] = useState("");

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

	function Sidebar(){
		return(
			<div className='sidebar-content'>
				<div className={`sidebar-item ${Active === "shorten" ? "Active" : ""}`} onClick={()=>setActive("shorten")}>🔗Shorten
				</div>
				<div className={`sidebar-item ${Active === "stats" ? "Active" : ""}`} onClick={()=>setActive("stats")}>📊Stats
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
				<div className="card">
					<h1>Paste Link Here</h1>

					<input
						type="text"
						placeholder="Enter your URL"
						value={Url}
						onChange={(e) => setUrl(e.target.value)}
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
			</div>
    </div>
  	);
}

export default App;
