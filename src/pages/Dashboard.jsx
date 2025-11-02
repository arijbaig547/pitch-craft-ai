import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from "firebase/firestore";

export default function Dashboard() {
    const [pages, setPages] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) navigate("/");
            else setUser(u);
        });
        return unsub;
    }, [navigate]);

    useEffect(() => {
        if (!user) return; // ✅ Wait for user then load pages

        const q = query(
            collection(db, "pitches"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snap) => {
            setPages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
    }, [user]);

    const logout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const deletePage = async (id) => {
        await deleteDoc(doc(db, "pitches", id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f0f15] via-[#131323] to-[#06080f] text-white p-4 sm:p-8">

            {/* ✅ Dashboard Header */}
            <header className="flex flex-wrap gap-4 justify-between items-center border-b border-gray-700/50 pb-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 
      text-transparent bg-clip-text drop-shadow-lg">
                    🚀 Your Startup Collection
                </h2>

               <div className="flex gap-4">
                    <button
                        onClick={() => navigate("/create")}
                        className="px-6 py-2 rounded-full font-medium bg-gradient-to-r from-purple-500/80 to-blue-500/80 
        hover:from-purple-500 hover:to-blue-500 transition-all duration-200 text-white shadow-md 
        hover:shadow-purple-500/30"
                    >
                        Chat With AI
                    </button>

                    <button
                        onClick={logout}
                        className="px-6 py-2 rounded-full font-medium bg-white/10 hover:bg-red-600/80 
        border border-white/20 hover:border-red-500 transition-all duration-200 text-white shadow-md 
        hover:shadow-red-500/20"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* ✅ Pages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {pages.map((p) => (
                    <div
                        key={p.id}
                        className="bg-white/10 backdrop-blur-lg border border-gray-700/40 rounded-2xl shadow-xl p-4 hover:shadow-indigo-500/30 transition-all duration-300"
                    >

                        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 
                       text-transparent bg-clip-text mb-1">
                            {p.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-300 mb-4">{p.tagline}</p>

                        {/* ✅ Responsive Iframe */}
                        <div className="rounded-lg overflow-hidden border border-gray-600 shadow-lg">
                            <iframe
                                srcDoc={p.html}
                                title={p.id}
                                className="w-full h-40 sm:h-48 md:h-56 lg:h-48"
                            ></iframe>
                        </div>

                        {/* ✅ HTML Code Section */}
                        <details className="mt-4 bg-black/40 border border-gray-700 rounded-lg">
                            <summary className="cursor-pointer p-3 text-indigo-300 hover:text-white transition">
                                📄 View Code
                            </summary>

                            <pre className="text-green-400 text-xs p-4 overflow-x-auto max-h-64">
                                {p.html}
                            </pre>

                            <button
                                className="mx-4 mb-4 bg-blue-600 hover:bg-blue-700 px-3 py-1 mt-2 rounded text-white text-sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(p.html)
                                        .then(() => alert("✅ Code Copied to Clipboard!"))
                                        .catch(() => alert("❌ Copy Failed! Please try again."));
                                }}
                            >
                                📋 Copy Code
                            </button>
                        </details>

                        {/* ✅ Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                            <button
                                onClick={() => navigate("/create", { state: p })}
                                className="bg-indigo-600/80 hover:bg-indigo-700 px-4 py-2 rounded-lg 
                         text-white font-medium transition-all shadow-md w-full"
                            >
                                View
                            </button>

                            <button
                                onClick={() => deletePage(p.id)}
                                className="bg-red-600/80 hover:bg-red-700 px-4 py-2 rounded-lg 
                         text-white font-medium transition-all shadow-md w-full"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                ))}
            </div>

            {/* ✅ No Pages UI */}
            {pages.length === 0 && (
                <div className="text-center mt-20 text-gray-400 text-lg">
                    No saved startup pages yet 👀
                    <br /> Create some magic! ✨
                </div>
            )}
        </div>
    );

}
