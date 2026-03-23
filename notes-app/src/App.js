import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import "./App.css";

const SECRET_KEY = "praveen_secret";

function App() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("notes");

    if (saved) {
      const decrypted = JSON.parse(saved).map((item) => {
        const bytes = CryptoJS.AES.decrypt(item, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      });
      setNotes(decrypted);
    }
  }, []);

  const saveNotes = (updatedNotes) => {
    const encrypted = updatedNotes.map((note) =>
      CryptoJS.AES.encrypt(JSON.stringify(note), SECRET_KEY).toString()
    );

    localStorage.setItem("notes", JSON.stringify(encrypted));
    setNotes(updatedNotes);
  };

  const addNote = () => {
    if (text.trim() === "") return;

    const newNote = {
      text: text,
      pinned: false,
      visible: false, // 👈 NEW
    };

    const updated = [...notes, newNote];
    saveNotes(updated);
    setText("");
  };

  const deleteNote = (index) => {
    const updated = notes.filter((_, i) => i !== index);
    saveNotes(updated);
  };

  const togglePin = (index) => {
    const updated = [...notes];
    updated[index].pinned = !updated[index].pinned;
    saveNotes(updated);
  };

  // 👇 NEW FUNCTION
  const toggleVisibility = (index) => {
    const updated = [...notes];
    updated[index].visible = !updated[index].visible;
    saveNotes(updated);
  };

  const filteredNotes = [...notes]
    .sort((a, b) => b.pinned - a.pinned)
    .filter((note) =>
      note.text.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="container">
      <h1>🔐 Secure Notes App</h1>

      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <textarea
        placeholder="Write your note..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br />

      <button onClick={addNote}>Add Note</button>

      <div className="notes">
        {filteredNotes.length === 0 ? (
          <p>No notes found</p>
        ) : (
          filteredNotes.map((note, index) => (
            <div key={index} className="card">

              {/* 👇 HIDE / REVEAL */}
              <p>
                {note.visible ? note.text : "🔒 Hidden"}
              </p>

              <button onClick={() => toggleVisibility(index)}>
                {note.visible ? "Hide" : "Reveal"}
              </button>

              <button onClick={() => togglePin(index)}>
                {note.pinned ? "Unpin" : "Pin"}
              </button>

              <button onClick={() => deleteNote(index)}>
                Delete
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;