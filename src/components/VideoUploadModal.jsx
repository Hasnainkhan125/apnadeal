// src/components/VideoUploadModal.jsx
// Advanced Short video upload: file, thumbnail, title, desc, tags
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes, FaSpinner, FaVideo, FaImage, FaUpload, FaCheck,
  FaChevronRight, FaChevronLeft, FaPlay, FaTrash, FaTag,
  FaPlus, FaCheckCircle, FaExclamationTriangle,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const MAX_VIDEO_MB = 100;
const MAX_VIDEO_SECONDS = 90;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];

/* ─── Upload a file to Supabase Storage, return URL ─── */
const uploadToStorage = async (file, folder) => {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("study-group-images")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("study-group-images").getPublicUrl(path);
  return data.publicUrl;
};

/* ─── Get video duration client-side ─── */
const getVideoDuration = (file) => new Promise((resolve) => {
  const v = document.createElement("video");
  v.preload = "metadata";
  v.onloadedmetadata = () => { URL.revokeObjectURL(v.src); resolve(v.duration); };
  v.onerror = () => resolve(0);
  v.src = URL.createObjectURL(file);
});

/* ─── Grab first frame as thumbnail ─── */
const grabThumbnail = (file, seekTime = 1) => new Promise((resolve, reject) => {
  const v = document.createElement("video");
  v.preload = "auto";
  v.muted = true;
  v.crossOrigin = "anonymous";

  v.onloadeddata = () => { try { v.currentTime = Math.min(seekTime, v.duration / 2); } catch {} };
  v.onseeked = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = v.videoWidth || 720;
      canvas.height = v.videoHeight || 1280;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Thumbnail capture failed")); return; }
        const file = new File([blob], "thumb.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg", 0.85);
    } catch (err) { reject(err); }
  };
  v.onerror = () => reject(new Error("Could not load video"));
  v.src = URL.createObjectURL(file);
});

const VideoUploadModal = ({ show, onClose, onSuccess, userGroups = [], user }) => {
  const [step, setStep] = useState(1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState(null);
  const [autoThumbing, setAutoThumbing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState([]);

  const [price, setPrice] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [linkedListingId, setLinkedListingId] = useState("");
  const [myListings, setMyListings] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  const videoRef = useRef(null);
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const scrollRef = useRef(null);

  /* Reset on open */
  useEffect(() => {
    if (show) {
      setStep(1);
      setVideoFile(null);
      setVideoPreviewUrl(null);
      setThumbFile(null);
      setThumbPreviewUrl(null);
      setTitle("");
      setDescription("");
      setTagsInput("");
      setTags([]);
      setPrice("");
      setLinkedListingId("");
      setUploading(false);
      if (userGroups.length === 1) setSelectedGroup(userGroups[0].id);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 50);
    }
  }, [show, userGroups]);

  /* Scroll body to top when changing step */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /* Load my listings */
  useEffect(() => {
    if (!show || !user) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("listings")
          .select("id, title, price, cover_image")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(50);
        setMyListings(data || []);
      } catch {}
    })();
  }, [show, user]);

  /* Video picker */
  const handleVideoPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      alert("Please select an MP4, WebM, or MOV video");
      return;
    }

    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      alert(`Video must be under ${MAX_VIDEO_MB} MB`);
      return;
    }

    const duration = await getVideoDuration(file);
    if (duration > MAX_VIDEO_SECONDS) {
      alert(`Video must be under ${MAX_VIDEO_SECONDS} seconds (yours is ${Math.round(duration)}s)`);
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    setAutoThumbing(true);
    try {
      const thumb = await grabThumbnail(file, Math.min(1, duration * 0.15));
      setThumbFile(thumb);
      setThumbPreviewUrl(URL.createObjectURL(thumb));
    } catch (err) {
      console.warn("Auto thumbnail failed:", err);
    } finally { setAutoThumbing(false); }
  };

  /* Custom thumbnail picker */
  const handleThumbPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please choose an image"); return; }
    if (file.size > 3 * 1024 * 1024) { alert("Thumbnail must be under 3 MB"); return; }
    setThumbFile(file);
    setThumbPreviewUrl(URL.createObjectURL(file));
  };

  /* Tag add */
  const addTag = () => {
    const t = tagsInput.trim().replace(/^#/, "").toLowerCase();
    if (!t || tags.includes(t) || tags.length >= 8) return;
    setTags([...tags, t]);
    setTagsInput("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const canNext = () => {
    if (step === 1) return !!videoFile;
    if (step === 2) return title.trim().length > 0 || description.trim().length > 0;
    if (step === 3) return !!selectedGroup;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) { alert("Sign in required"); return; }
    if (!videoFile) { alert("Choose a video first"); return; }
    if (!selectedGroup) { alert("Select a group"); return; }

    setUploading(true);
    try {
      setProgressMsg("Uploading video…");
      const videoUrl = await uploadToStorage(videoFile, "shorts/videos");

      let thumbUrl = null;
      if (thumbFile) {
        setProgressMsg("Uploading thumbnail…");
        thumbUrl = await uploadToStorage(thumbFile, "shorts/thumbs");
      }

      setProgressMsg("Publishing…");
      const duration = await getVideoDuration(videoFile);

      const { data, error } = await supabase.from("study_group_posts").insert([{
        user_id: user.id,
        group_id: selectedGroup,
        title: title.trim(),
        content: description.trim() || title.trim(),
        image_url: videoUrl,
        media_type: "video",
        video_thumbnail: thumbUrl,
        video_duration: duration,
        tags,
        is_short: true,
        short_title: title.trim(),
        short_description: description.trim(),
        short_views: 0,
        short_likes: 0,
        short_comments: 0,
        price: price ? Number(price) : null,
        listing_id: linkedListingId || null,
      }]).select().single();

      if (error) throw error;

      setProgressMsg("Done!");
      onSuccess?.(data);
      setTimeout(() => onClose?.(), 400);
    } catch (err) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setProgressMsg("");
    }
  };

  if (!show) return null;

  const steps = [
    { id: 1, label: "Video", icon: FaVideo },
    { id: 2, label: "Details", icon: FaTag },
    { id: 3, label: "Publish", icon: FaUpload },
  ];

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full sm:max-w-2xl flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl"
            style={{
              background: "var(--sp-card, #fff)",
              border: "1px solid var(--sp-line, #eee)",
              /* Mobile: fill viewport but stop above the bottom nav bar */
              height: "92vh",
              maxHeight: "92vh",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Header — fixed top, compact on mobile */}
            <div className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-4 flex items-center justify-between border-b"
              style={{ borderColor: "var(--sp-line, #eee)" }}>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))" }}>
                  <FaVideo className="text-white text-[11px] sm:text-sm" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-lg font-black truncate" style={{ color: "var(--sp-txt, #000)" }}>
                    Upload Short
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-medium truncate" style={{ color: "var(--sp-txt-soft, #666)" }}>
                    Step {step} of 3 · {steps[step - 1].label}
                  </p>
                </div>
              </div>
              <button onClick={onClose} disabled={uploading}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex items-center justify-center hover:opacity-70 disabled:opacity-40 shrink-0"
                style={{ background: "var(--sp-card-2, #f5f5f5)" }}>
                <FaTimes className="text-xs sm:text-sm" />
              </button>
            </div>

            {/* Step pills */}
            <div className="flex-shrink-0 px-3 sm:px-5 pt-2.5 sm:pt-4 pb-1 flex items-center gap-1.5 sm:gap-2">
              {steps.map((s, i) => {
                const active = step === s.id;
                const done = step > s.id;
                const Icon = s.icon;
                return (
                  <React.Fragment key={s.id}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-all"
                        style={{
                          background: done ? "#16A34A" : active
                            ? "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))"
                            : "var(--sp-card-2, #f5f5f5)",
                        }}
                      >
                        {done ? (
                          <FaCheck className="text-white text-[9px] sm:text-[10px]" />
                        ) : (
                          <Icon className="text-[10px] sm:text-[11px]" style={{ color: active ? "#fff" : "var(--sp-txt-faint, #999)" }} />
                        )}
                      </div>
                      <span className="hidden sm:block text-[11px] font-bold"
                        style={{ color: active ? "var(--sp-txt, #000)" : "var(--sp-txt-faint, #999)" }}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex-1 h-[2px] rounded-full"
                        style={{ background: step > s.id ? "#16A34A" : "var(--sp-line, #eee)" }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Body — scrollable middle */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 pb-24 sm:pb-5">
              {/* STEP 1: VIDEO */}
              {step === 1 && (
                <div className="space-y-3 sm:space-y-4">
                  {!videoPreviewUrl ? (
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center py-10 sm:py-14 rounded-2xl sm:rounded-3xl transition-all hover:scale-[1.01]"
                      style={{ background: "var(--sp-card-2, #f5f5f5)", border: "2px dashed var(--sp-line-str, #ccc)" }}
                    >
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
                        style={{ background: "var(--sp-primary-soft, rgba(245,130,32,0.1))" }}>
                        <FaVideo className="text-xl sm:text-2xl" style={{ color: "var(--sp-primary, #F58220)" }} />
                      </div>
                      <p className="text-xs sm:text-sm font-black" style={{ color: "var(--sp-txt, #000)" }}>
                        Choose a video
                      </p>
                      <p className="text-[10px] sm:text-[11px] mt-1 text-center px-4" style={{ color: "var(--sp-txt-soft, #666)" }}>
                        MP4 / WebM / MOV · max {MAX_VIDEO_MB}MB · max {MAX_VIDEO_SECONDS}s
                      </p>
                    </button>
                  ) : (
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black mx-auto w-full"
                        style={{ aspectRatio: "9/16", maxHeight: "38vh" }}>
                        <video
                          ref={videoRef}
                          src={videoPreviewUrl}
                          className="w-full h-full object-contain"
                          controls
                          playsInline
                        />
                        <button
                          onClick={() => videoInputRef.current?.click()}
                          className="absolute top-2 right-2 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur"
                        >
                          Change
                        </button>
                      </div>

                      {/* Thumbnail */}
                      <div className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3"
                        style={{ background: "var(--sp-card-2, #f5f5f5)", border: "1px solid var(--sp-line, #eee)" }}>
                        <div className="h-12 w-9 sm:h-16 sm:w-12 rounded-lg overflow-hidden flex-shrink-0 bg-black flex items-center justify-center">
                          {autoThumbing ? (
                            <FaSpinner className="animate-spin text-white text-xs sm:text-sm" />
                          ) : thumbPreviewUrl ? (
                            <img src={thumbPreviewUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FaImage className="text-white/50 text-xs sm:text-sm" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] sm:text-xs font-black truncate" style={{ color: "var(--sp-txt, #000)" }}>
                            Thumbnail {thumbFile ? "(auto)" : ""}
                          </p>
                          <p className="text-[9px] sm:text-[10px] mt-0.5 truncate" style={{ color: "var(--sp-txt-soft, #666)" }}>
                            {thumbFile ? "Tap to replace" : "Pick an image"}
                          </p>
                        </div>
                        <button
                          onClick={() => thumbInputRef.current?.click()}
                          className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] font-bold shrink-0"
                          style={{ background: "var(--sp-primary-soft, rgba(245,130,32,0.1))", color: "var(--sp-primary, #F58220)" }}
                        >
                          {thumbFile ? "Replace" : "Choose"}
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                    onChange={handleVideoPick} className="hidden"
                  />
                  <input
                    ref={thumbInputRef} type="file" accept="image/*"
                    onChange={handleThumbPick} className="hidden"
                  />
                </div>
              )}

              {/* STEP 2: DETAILS */}
              {step === 2 && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2"
                      style={{ color: "var(--sp-txt-soft, #666)" }}>
                      Title *
                    </label>
                    <input
                      type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      maxLength={80}
                      placeholder="e.g. iPhone 15 Pro Max Unboxing"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm outline-none"
                      style={{
                        background: "var(--sp-card-2, #f5f5f5)",
                        color: "var(--sp-txt, #000)",
                        border: "1.5px solid var(--sp-line, #eee)",
                      }}
                    />
                    <p className="text-[10px] text-right mt-1" style={{ color: "var(--sp-txt-faint, #999)" }}>
                      {title.length}/80
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2"
                      style={{ color: "var(--sp-txt-soft, #666)" }}>
                      Description
                    </label>
                    <textarea
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      placeholder="Describe the product, condition, key features…"
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm outline-none resize-none"
                      style={{
                        background: "var(--sp-card-2, #f5f5f5)",
                        color: "var(--sp-txt, #000)",
                        border: "1.5px solid var(--sp-line, #eee)",
                      }}
                    />
                    <p className="text-[10px] text-right mt-1" style={{ color: "var(--sp-txt-faint, #999)" }}>
                      {description.length}/500
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2"
                      style={{ color: "var(--sp-txt-soft, #666)" }}>
                      Tags (max 8)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text" value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        placeholder="e.g. iphone, sale, karachi"
                        className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm outline-none"
                        style={{
                          background: "var(--sp-card-2, #f5f5f5)",
                          color: "var(--sp-txt, #000)",
                          border: "1.5px solid var(--sp-line, #eee)",
                        }}
                      />
                      <button
                        onClick={addTag} disabled={!tagsInput.trim() || tags.length >= 8}
                        className="px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm disabled:opacity-40 shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))" }}
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {tags.map((t) => (
                          <span key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold"
                            style={{ background: "var(--sp-primary-soft, rgba(245,130,32,0.1))", color: "var(--sp-primary, #F58220)" }}>
                            #{t}
                            <button onClick={() => removeTag(t)} className="hover:opacity-70">
                              <FaTimes className="text-[8px]" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Optional price */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2"
                      style={{ color: "var(--sp-txt-soft, #666)" }}>
                      Price (Rs, optional)
                    </label>
                    <input
                      type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 145000"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm outline-none"
                      style={{
                        background: "var(--sp-card-2, #f5f5f5)",
                        color: "var(--sp-txt, #000)",
                        border: "1.5px solid var(--sp-line, #eee)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: PUBLISH */}
              {step === 3 && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2"
                      style={{ color: "var(--sp-txt-soft, #666)" }}>
                      Publish to group *
                    </label>
                    {userGroups.length === 0 ? (
                      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #EF4444" }}>
                        <FaExclamationTriangle className="text-sm flex-shrink-0" style={{ color: "#EF4444" }} />
                        <p className="text-xs font-bold" style={{ color: "#EF4444" }}>
                          You need to join a group first.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 sm:space-y-2 max-h-44 sm:max-h-56 overflow-y-auto">
                        {userGroups.map((g) => {
                          const active = selectedGroup === g.id;
                          return (
                            <button
                              key={g.id}
                              onClick={() => setSelectedGroup(g.id)}
                              className="w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition text-left"
                              style={{
                                background: active ? "var(--sp-primary-soft, rgba(245,130,32,0.1))" : "var(--sp-card-2, #f5f5f5)",
                                border: `1.5px solid ${active ? "var(--sp-primary, #F58220)" : "var(--sp-line, #eee)"}`,
                              }}
                            >
                              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))" }}>
                                {g.image_url ? (
                                  <img src={g.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-white font-black text-xs sm:text-sm">{(g.name || "G").charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-bold truncate" style={{ color: "var(--sp-txt, #000)" }}>
                                  {g.name}
                                </p>
                                <p className="text-[9px] sm:text-[10px] capitalize" style={{ color: "var(--sp-txt-soft, #666)" }}>
                                  {g.role === "admin" ? "👑 Admin" : "Member"}
                                </p>
                              </div>
                              {active && <FaCheckCircle className="text-sm shrink-0" style={{ color: "var(--sp-primary, #F58220)" }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Optional listing link */}
                  {myListings.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 sm:mb-2"
                        style={{ color: "var(--sp-txt-soft, #666)" }}>
                        Link to a listing (optional)
                      </label>
                      <select
                        value={linkedListingId}
                        onChange={(e) => setLinkedListingId(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm outline-none"
                        style={{
                          background: "var(--sp-card-2, #f5f5f5)",
                          color: "var(--sp-txt, #000)",
                          border: "1.5px solid var(--sp-line, #eee)",
                        }}
                      >
                        <option value="">— No linked listing —</option>
                        {myListings.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title} · Rs {l.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden"
                    style={{ background: "var(--sp-card-2, #f5f5f5)", border: "1px solid var(--sp-line, #eee)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest px-3 pt-2.5 sm:pt-3 pb-1.5 sm:pb-2"
                      style={{ color: "var(--sp-txt-soft, #666)" }}>
                      Preview
                    </p>
                    <div className="px-3 pb-3">
                      <div className="relative rounded-lg sm:rounded-xl overflow-hidden bg-black mx-auto"
                        style={{ aspectRatio: "9/16", maxHeight: 180 }}>
                        {videoPreviewUrl && (
                          <video src={videoPreviewUrl} className="w-full h-full object-contain" muted playsInline autoPlay loop />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3"
                          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85), transparent)" }}>
                          <p className="text-white text-[11px] sm:text-xs font-black truncate">{title || "Your title"}</p>
                          {description && (
                            <p className="text-white/80 text-[9px] sm:text-[10px] mt-0.5 line-clamp-2">{description}</p>
                          )}
                          {tags.length > 0 && (
                            <p className="text-white/70 text-[9px] sm:text-[10px] mt-1 truncate">
                              {tags.map((t) => `#${t}`).join(" ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — sticky at bottom of modal, above bottom nav */}
            <div
              className="flex-shrink-0 px-3 sm:px-5 py-2.5 sm:py-4 flex items-center gap-2 sm:gap-3 border-t"
              style={{
                borderColor: "var(--sp-line, #eee)",
                background: "var(--sp-card, #fff)",
                paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))",
              }}
            >
              <button
                onClick={step === 1 ? onClose : () => setStep(step - 1)}
                disabled={uploading}
                className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm disabled:opacity-40 shrink-0"
                style={{ background: "var(--sp-card-2, #f5f5f5)", color: "var(--sp-txt, #000)" }}
              >
                {step === 1 ? "Cancel" : "Back"}
              </button>

              {step < 3 ? (
                <button
                  onClick={() => canNext() && setStep(step + 1)}
                  disabled={!canNext()}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))" }}
                >
                  Continue <FaChevronRight className="text-[10px] sm:text-xs" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={uploading || !selectedGroup || !videoFile}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, var(--sp-primary, #F58220), var(--sp-primary-2, #E26A2C))" }}
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin text-xs sm:text-sm" />
                      <span className="truncate">{progressMsg || "Publishing…"}</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-xs sm:text-sm" /> Publish Short
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VideoUploadModal;