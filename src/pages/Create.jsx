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

// ✅ Helper function to detect HTML content
function isHTMLCode(text) {
    return /<\/?[a-z][\s\S]*>/i.test(text);
}

export default function Create() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const navigate = useNavigate();

    // ✅ Gemini setup
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ✅ Auth check
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) navigate("/login");
            else setUser(u);
        });
        return unsub;
    }, []);

    // ✅ Real-time chat updates
    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "chats"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "asc")
        );
        const unsub = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map((d) => d.data());
            setMessages(msgs);
        });
        return unsub;
    }, [user]);

    // ✅ Send message + Gemini reply
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const userMsg = {
            userId: user.uid,
            sender: "user",
            text: input,
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "chats"), userMsg);
        setInput("");
        setLoadingAI(true);

        try {
            const result = await model.generateContent(`
You are a startup mentor AI. 
Format your answer neatly in **markdown** with clear headings, bullet points, and bold keywords. 
If the user requests a "landing page" or HTML/CSS design, generate complete HTML & CSS code.
User says: ${input}.
      `);

            const aiText = result.response.text();

            const aiMsg = {
                userId: user.uid,
                sender: "ai",
                text: aiText,
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, "chats"), aiMsg);
        } catch (err) {
            console.error("AI Error:", err);
            await addDoc(collection(db, "chats"), {
                userId: user.uid,
                sender: "ai",
                text: "⚠️ Sorry, I couldn't process your request.",
                createdAt: serverTimestamp(),
            });
        }
        setLoadingAI(false);
    };

    // ✅ Logout
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="bg-gradient-to-br from-[#0a0a0f] via-[#101018] to-[#0d0d12] text-white min-h-screen flex flex-col font-sans">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black/40 backdrop-blur-lg sticky top-0 z-50">
                <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    🚀 AI Startup Partner
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-200 hover:scale-105"
                >
                    Sign Out
                </button>
            </header>

            {/* Chat */}
            <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-2xl px-5 py-4 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-lg transition-all duration-300 ${m.sender === "user"
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                                    : "bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700 rounded-bl-none"
                                }`}
                        >
                            {isHTMLCode(m.text) ? (
                                <div className="mt-3 border border-gray-700 rounded-xl overflow-hidden shadow-inner">
                                    <iframe
                                        className="w-full h-[400px] bg-white"
                                        srcDoc={m.text}
                                        title={`Preview-${i}`}
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none">
                                    <ReactMarkdown>{m.text}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loadingAI && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none text-gray-300 animate-pulse">
                            AI is typing...
                        </div>
                    </div>
                )}
            </main>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="flex items-center gap-3 p-4 border-t border-gray-800 bg-black/60 backdrop-blur-lg"
            >
                <input
                    type="text"
                    className="flex-1 bg-gray-900/70 text-white px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 transition-all duration-200"
                    placeholder="Describe your startup idea or say 'make a landing page'..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-200 hover:scale-105"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
