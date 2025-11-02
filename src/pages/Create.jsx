import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

function parseAIResponse(text) {
    let html = null;

    if (text.includes("###HTML###")) {
        html = text.split("###HTML###")[1].trim();
    }

    if (html?.startsWith("```html")) {
        html = html.replace(/```html|```/gi, "").trim();
    }

    if (!html && (text.includes("<html") || text.includes("<body"))) {
        html = text.trim();
        html = html.replace(/```html|```/gi, "").trim();
    }

    return {
        name: text.match(/###NAME###\n(.+?)\n/)?.[1] || null,
        tagline: text.match(/###TAGLINE###\n(.+?)\n/)?.[1] || null,
        html,
    };
}

export default function Create() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const navigate = useNavigate();

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) navigate("/");
            else setUser(u);
        });
        return unsub;
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "chats"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "asc")
        );
        return onSnapshot(q, (snap) => {
            setMessages(snap.docs.map((d) => d.data()));
        });
    }, [user]);

    const chatSession = model.startChat({
        history: messages
            .filter((m) => m.text)
            .map((m) => ({
                role: m.sender === "user" ? "user" : "model",
                parts: [{ text: m.text }],
            })),
    });

    const saveToDashboard = async (pitch) => {
        await addDoc(collection(db, "pitches"), {
            userId: user.uid,
            name: pitch.name,
            tagline: pitch.tagline,
            html: pitch.html,
            createdAt: serverTimestamp(),
        });
        alert("✅ Saved to Dashboard!");
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        await addDoc(collection(db, "chats"), {
            userId: user.uid,
            sender: "user",
            text: input,
            createdAt: serverTimestamp(),
        });

        setInput("");
        setLoadingAI(true);

        try {
            const result = await chatSession.sendMessage(
                `
 Follow EXACT rules:

1️⃣ Name & Tagline:
If user wants startup name and tagline only:
Format:
###NAME###
{startup name}
###TAGLINE###
{short tagline}

2️⃣ Premium Website:
If user wants a website (HTML + CSS):
- Create a modern, professional, and premium website
- Fully responsive (desktop, tablet, mobile)
- Clean layout, elegant spacing, subtle shadows
- Color palette: primary (#1F2937), secondary (#3B82F6), accent (#F59E0B), background (#F9FAFB)
- Typography: headings 'Poppins' (bold), body 'Roboto'
- Sections: Hero, About, Features/Programs, Services, Pricing, Testimonials, Contact
- Use semantic HTML (header, nav, main, section, footer)
- Buttons: smooth hover effects, rounded, modern
- Cards: rounded corners, subtle shadow
- Provide only HTML & CSS (no JS, no explanations)
- Use placeholder images/text where needed
- Wrap everything in ###HTML### block

User:
${input}
`
            );

            const output = await result.response.text();
            const parsed = parseAIResponse(output);

            await addDoc(collection(db, "chats"), {
                userId: user.uid,
                sender: "ai",
                ...parsed,
                text: parsed.html ? null : output,
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            console.log("AI Error:", err);
            alert("❌ Gemini limit hit — try again later");
        }

        setLoadingAI(false);
    };

    const handleLogout = async () => signOut(auth);

    return (
        <div className="bg-[#020314] text-white min-h-screen flex flex-col">

            {/* ✅ Premium Navbar */}
            <header className="flex justify-between items-center px-10 py-6 bg-black/40 border-b border-white/10 backdrop-blur-xl shadow-md">
                <h1
                    onClick={() => navigate("/")}
                    className="cursor-pointer text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                >
                    🚀 AI Startup Partner
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-2 rounded-full font-medium bg-gradient-to-r from-purple-500/80 to-blue-500/80 
        hover:from-purple-500 hover:to-blue-500 transition-all duration-200 text-white shadow-md 
        hover:shadow-purple-500/30"
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 rounded-full font-medium bg-white/10 hover:bg-red-600/80 
        border border-white/20 hover:border-red-500 transition-all duration-200 text-white shadow-md 
        hover:shadow-red-500/20"
                    >
                        Logout
                    </button>
                </div>

            </header>

            <div className="flex flex-1">

                {/* ✅ Beautiful Side Panel */}
                <aside className="hidden md:flex flex-col w-72 bg-black/30 border-r border-white/10 p-6 gap-6">
                    <div className="bg-white/10 p-5 rounded-xl">
                        <h2 className="text-xl font-semibold mb-2">✨ AI Startup Partner</h2>
                        <p className="text-gray-300 text-sm">
                            Brainstorm professional startup name,tagline & premium landing pages instantly!
                        </p>
                    </div>

                    <div className="bg-white/10 p-5 rounded-xl">
                        <h2 className="text-lg font-semibold mb-2">🔥 Tips</h2>
                        <ul className="text-gray-400 text-sm space-y-1">
                            <li>• Give website type (Travel, Fitness, SaaS)</li>
                            <li>• Describe your business clearly</li>
                        </ul>
                    </div>
                </aside>

                {/* ✅ Chat Section */}
                <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>

                            <div
                                className={`max-w-[600px] p-5 rounded-2xl shadow-lg ${m.sender === "user"
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                                        : "bg-white/10 border border-white/10"
                                    }`}
                            >
                                {m.html ? (
                                    <div>
                                        <iframe
                                            srcDoc={m.html}
                                            className="w-[500px] h-[400px] rounded-lg border mb-3"
                                        />
                                        <button
                                            onClick={() => saveToDashboard(m)}
                                            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            💾 Save to Dashboard
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-gray-200 whitespace-pre-line">
                                        <ReactMarkdown>{m.text}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loadingAI && (
                        <p className="text-center text-gray-400 animate-pulse">🤖 Ai is Thinking</p>
                    )}
                </main>
            </div>

            {/* ✅ Input Section */}
            <form onSubmit={handleSend} className="flex gap-3 p-4 bg-black/40 border-t border-gray-800">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-white/10 px-6 py-3 rounded-full outline-none"
                    placeholder="Describe your startup idea…"
                />
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-3 rounded-full font-semibold hover:opacity-90 transition">
                    Send ✨
                </button>
            </form>
        </div>
    );
}
