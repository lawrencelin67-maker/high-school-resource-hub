import React, { useState, useEffect } from 'react';
import { inject } from '@vercel/analytics';
import { PiCompassRoseFill, PiRocketLaunchFill, PiCursorClickFill, PiChatCenteredTextFill, PiMagicWandFill } from "react-icons/pi";

inject(); // 這行會啟動統計功能
function CommentBox({ text }) {
  return (
    <div style={{ padding: "15px 20px", backgroundColor: "#fff", borderRadius: "15px", borderLeft: "5px solid #2563eb", marginBottom: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontSize: "15px", color: "#334155" }}>
      {text}
    </div>
  );
}

function VideoCard({ video }) {
  // 新增一個 state 來偵測滑鼠有沒有在卡片上
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      // 當滑鼠進去時，設為 true；離開時設為 false
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        padding: "25px", 
        borderRadius: "24px", 
        textAlign: "center", 
        backgroundColor: "rgba(255, 255, 255, 0.75)", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between", 
        minHeight: "320px",
        
        // --- 核心改動：絲滑浮動效果 ---
        backdropFilter: "blur(12px)", // 毛玻璃高級感
        border: isHovered ? "1.5px solid #3b82f6" : "1.5px solid rgba(255, 255, 255, 0.3)", // 邊框微亮
        transform: isHovered ? "translateY(-12px) scale(1.02)" : "translateY(0) scale(1)", // 往上飄移並放大
        boxShadow: isHovered 
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.15)" 
          : "0 10px 20px rgba(0, 0, 0, 0.05)", // 陰影變深，感覺像飄起來
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)", // 專業的高級轉場曲線
        cursor: "pointer"
      }}
    >
      <div>
        <p style={{ fontWeight: "900", fontSize: "22px", marginBottom: "10px", color: "#1e293b", letterSpacing: "-0.5px" }}>
          {video.title}
        </p>
        <div style={{ display: "inline-block", backgroundColor: "#fee2e2", color: "#ef4444", padding: "4px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", marginBottom: "15px" }}>
          LIVE 訂閱數
        </div>
        <div style={{ fontSize: "32px", fontWeight: "900", color: "#2563eb", marginBottom: "20px" }}>
          {video.subs}
        </div>
      </div>
      <a href={video.link} target="_blank" rel="noopener noreferrer" style={{ 
        display: "block", 
        padding: "14px", 
        backgroundColor: "#2563eb", 
        color: "#fff", 
        borderRadius: "15px", 
        textDecoration: "none", 
        fontWeight: "bold", 
        fontSize: "16px",
        boxShadow: isHovered ? "0 8px 20px rgba(37, 99, 235, 0.3)" : "none",
        transition: "0.3s"
      }}>
        進入頻道學習
      </a>
    </div>
  );
}
// --- 這裡就是你的環境偵測雷達 ---
const API_BASE = window.location.hostname === "localhost" 
  ? "http://127.0.0.1:5000"  // 如果你在自己電腦跑，抓這裡
  : "https://high-school-resource-hub.onrender.com"; // 上架後，Render 會給你一個網址，已填
export default function App() {
  const [data, setData] = useState({}); 
  const [menu, setMenu] = useState("使用教學");
  const [subject, setSubject] = useState("數學");
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const instruction = [
    { icon: <PiRocketLaunchFill color="#ef4444" />, text: "歡迎來到高中數理科學學習資源網！這是一個專為高中生打造的一站式資源導航，幫助您尋找數學、物理、化學等最優質的免費資源。" },
    { icon: <PiCursorClickFill color="#3b82f6" />, text: "點擊上方的「學習資源」按鈕並選擇科目，按下「進入頻道學習」，即可查看 YouTube 頻道與網站等免費資源。" },
    { icon: <PiChatCenteredTextFill color="#8b5cf6" />, text: "如果你有推薦的老師或資源，歡迎到「許願回饋」區留言，我們誠摯歡迎您寶貴的意見！" },
    { icon: <PiMagicWandFill color="#f59e0b" />, text: "願這個小站能成為你數理學習路上的最強助手！" }
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, resCom] = await Promise.all([
          fetch(`${API_BASE}/api/resources`),
          fetch(`${API_BASE}/api/comments`)
        ]);
        setData(await resRes.json());
        setComments((await resCom.json()).reverse().slice(0, 30));
        // 刪掉 setInstruction 那行，因為我們現在不用抓了
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (input.trim() === "") return;
    try {
      const response = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: input })
      });
      if (response.ok) {
        const res = await fetch(`${API_BASE}/api/comments`);
        setComments((await res.json()).reverse().slice(0, 30));
        setInput(""); 
      }
    } catch (err) {}
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '20px' }}>正在從探險基地抓取資料中... 🔭</div>;

  return (

    <div style={{ 

      minHeight: "100vh", 

      // --- 新增：全域專業字體 ---

      fontFamily: "'Inter', 'Noto Sans TC', sans-serif", 

      // --- 新增：淡雅的網格背景，取代原本的死板漸層 ---

      backgroundColor: "#f8fafc",

      backgroundImage: "radial-gradient(#e2e8f0 1.5px, transparent 1.5px)",

      backgroundSize: "30px 30px", 

      padding: "40px 20px" 

    }}>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <header style={{ textAlign: "center", marginBottom: "50px", paddingTop: "40px" }}>

          {/* 修改：讓標題更有質感，增加字距壓縮 */}

          <h1 style={{ 

            background: "linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa)", 

            WebkitBackgroundClip: "text", 

            WebkitTextFillColor: "transparent", 

            fontSize: "3.8rem", 

            fontWeight: "900", 

            letterSpacing: "-3px", 

            margin: "0" 

          }}>

            高中數理學習資源網 <span style={{ WebkitTextFillColor: "initial" }}>🔭</span>

          </h1>

          <p style={{ color: "#648b7a", marginTop: "15px", fontSize: "1.2rem", fontWeight: "600", fontStyle: "italic" }}>

            知識就是力量--by 培根與薯條XDXD。

          </p>

        </header>



        <div style={{ textAlign: "center", marginBottom: "40px", display: "flex", justifyContent: "center", gap: "20px" }}>

          {[{ id: "使用教學", label: "💡 使用教學" }, { id: "學習資源", label: "📚 學習資源" }, { id: "留言區", label: "💬 許願回饋" }].map((item) => (

            <button 

              key={item.id} 

              onClick={() => setMenu(item.id)} 

              style={{ 

                padding: "14px 32px", 

                borderRadius: "16px", 

                border: "none", 

                cursor: "pointer", 

                fontSize: "17px", 

                fontWeight: "800", 

                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", // 加入絲滑轉場

                backgroundColor: menu === item.id ? "#2563eb" : "#ffffff", 

                color: menu === item.id ? "#ffffff" : "#475569", 

                boxShadow: menu === item.id ? "0 12px 24px rgba(37,99,235,0.3)" : "0 4px 6px rgba(0,0,0,0.05)", 

                transform: menu === item.id ? "translateY(-4px)" : "none" 

              }}

            >

              {item.label}

            </button>

          ))}

        </div>

        {menu === "學習資源" && (
          <>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
              {Object.keys(data).map(subj => (
                <button key={subj} onClick={() => setSubject(subj)} style={{ padding: "10px 22px", borderRadius: "12px", border: "none", cursor: "pointer", backgroundColor: subject === subj ? "#1e293b" : "#fff", color: subject === subj ? "#fff" : "#64748b", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                  {subj}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
              {data[subject] && data[subject].map((v, i) => <VideoCard key={i} video={v} />)}
            </div>
          </>
        )}

        {menu === "留言區" && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="請輸入留言..." style={{ flex: 1, padding: "15px", borderRadius: "10px", border: "1px solid #ccc" }} />
              <button onClick={handleSubmit} style={{ padding: "10px 25px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer" }}>送出</button>
            </div>
            <div>{comments.map((c, i) => <CommentBox key={i} text={c} />)}</div>
          </div>
        )}

        {menu === "使用教學" && (
          <div style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", padding: "40px", borderRadius: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", lineHeight: "2.2", color: "#334155" }}>
            <h2 style={{ color: "#2563eb", marginBottom: "25px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <PiCompassRoseFill size={32} /> 探險指南
            </h2>
            {instruction.map((item, index) => (
              <p key={index} style={{ fontSize: "18px", fontWeight: "500", marginBottom: "15px", borderBottom: "1px dashed #e2e8f0", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                {item.icon}
                <span>{item.text}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}