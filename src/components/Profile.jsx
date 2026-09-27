import React, { useState, useEffect } from 'react';
import { auth, db } from '../pages/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import sound from '../utils/soundEffects';
import { colors, fontFamily } from './dashboard/dashboardStyles';
import { AVATAR_SHOP_ITEMS, RARITY_CONFIG, DEFAULT_AVATAR_ID } from '../data/avatarShop';

// ===== MUTED GAME UI PALETTE (soft, not too bright) =====
const palette = {
  warmOrange: '#E9A075',
  warmOrangeShadow: '#C27E4F',
  coral: '#DB7A64',
  coralShadow: '#A95845',
  teal: '#4F9188',
  tealShadow: '#3A6A63',
  deepNavy: '#2A2845',
  deepNavyLight: '#3A3757',
  bodyText: '#6B6880',
  bodyTextSoft: '#8A8799',
  cream: '#FDF9F3',
  creamSoft: '#F5EFE6',
  white: '#FFFFFF',
  border: '#EBE2D5',
  borderSoft: '#F2EBE0',
  softGreen: '#7FA574',
  softGreenShadow: '#5E7F55',
  shadow: 'rgba(42, 40, 69, 0.06)',
  shadowMd: 'rgba(42, 40, 69, 0.10)',
  success: '#7FA574',
  danger: '#DB7A64',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Nunito', monospace";

const chunkyButton = (bg, shadowColor) => ({
  background: bg,
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: `0 3px 0 ${shadowColor}`,
  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
  fontFamily: FONT_DISPLAY,
});

// ===== DUOTONE SVG ICONS =====
const Icon = ({ name, size = 20, color = palette.bodyTextSoft }) => {
  const icons = {
    user: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" stroke={color} strokeWidth="2" fill="none"/>
        <path d="M8 11V7a4 4 0 118 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    check: (
      <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    pencil: (
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    shop: (
      <>
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="9" cy="20" r="1" stroke={color} strokeWidth="2" fill="none"/>
        <circle cx="18" cy="20" r="1" stroke={color} strokeWidth="2" fill="none"/>
      </>
    ),
    arrowLeft: (
      <path d="M19 12H5M12 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    book: (
      <>
        <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 00-3 3V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 4v16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </>
    ),
    game: (
      <>
        <path d="M6 12h4m-2-2v4m6-4h.01M17 12h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M8 20h8a4 4 0 004-4V8a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
    flame: (
      <path d="M12 2s4 6 4 10a4 4 0 11-8 0c0-2 1-3.5 2-5 0 2 1 3 2 3 0-2-1-5 0-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    trophy: (
      <>
        <path d="M6 4h12v4a6 6 0 01-12 0V4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M6 8H4a2 2 0 002 2M18 8h2a2 2 0 01-2 2M9 18h6M10 21h4M12 14v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      {icons[name] || icons.user}
    </svg>
  );
};

const Profile = ({ onBack }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [equippedAvatarId, setEquippedAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [ownedAvatars, setOwnedAvatars] = useState([]);
  const [pendingEquipId, setPendingEquipId] = useState(null);

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    settings: {
      emailNotifications: true,
      darkMode: false,
      language: 'en'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (document.getElementById('vocabo-profile-fonts')) return;
    const link = document.createElement('link');
    link.id = 'vocabo-profile-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handleEquipChange = (e) => {
      if (e.detail?.avatarId) {
        setEquippedAvatarId(e.detail.avatarId);
      }
    };
    window.addEventListener('avatarEquipped', handleEquipChange);
    return () => window.removeEventListener('avatarEquipped', handleEquipChange);
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage({ type: 'error', text: 'No user logged in' });
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const firestoreData = userDoc.data();

        const equipped = firestoreData.equippedAvatar || DEFAULT_AVATAR_ID;
        setEquippedAvatarId(equipped);
        setPendingEquipId(equipped);

        const freeAvatarIds = AVATAR_SHOP_ITEMS
          .filter(a => a.price === 0)
          .map(a => a.id);
        const owned = firestoreData.ownedAvatars || [];
        const allOwned = [...new Set([...owned, ...freeAvatarIds])];
        setOwnedAvatars(allOwned);

        const updatedProfile = {
          ...firestoreData,
          uid: user.uid,
          email: user.email
        };

        setUserProfile(updatedProfile);
        setFormData({
          displayName: firestoreData.displayName || '',
          username: firestoreData.username || '',
          bio: firestoreData.bio || '',
          email: user.email || '',
          phone: firestoreData.phone || '',
          location: firestoreData.location || '',
          website: firestoreData.website || '',
          socialLinks: firestoreData.socialLinks || { twitter: '', instagram: '', linkedin: '' },
          settings: firestoreData.settings || { emailNotifications: true, darkMode: false, language: 'en' }
        });

        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        setMessage({ type: 'success', text: 'Profile loaded successfully' });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSettingChange = (setting, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updatePasswordHandler = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAvatar = (avatarId) => {
    if (!ownedAvatars.includes(avatarId)) {
      setMessage({ type: 'error', text: 'Hindi mo pa owned yan! Bisitahin ang Avatar Shop.' });
      return;
    }
    setPendingEquipId(avatarId);
    setMessage({ type: '', text: '' });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const profileData = {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        socialLinks: formData.socialLinks,
        settings: formData.settings,
        updatedAt: new Date().toISOString()
      };

      if (pendingEquipId && pendingEquipId !== equippedAvatarId) {
        profileData.equippedAvatar = pendingEquipId;
        setEquippedAvatarId(pendingEquipId);

        window.dispatchEvent(new CustomEvent('avatarEquipped', {
          detail: { avatarId: pendingEquipId }
        }));
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, profileData);

      const savedProgress = localStorage.getItem('vocaboplay_progress');
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      const updatedProfile = {
        ...userProfile,
        ...profileData,
        email: user.email,
        wordsLearned: progress.wordsLearned || 0,
        gamesPlayed: progress.gamesPlayed || 0,
        streak: progress.streak || 0,
        totalPoints: progress.totalPoints || 0,
        level: progress.level || 1
      };

      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      const event = new CustomEvent('profileUpdated', { detail: updatedProfile });
      window.dispatchEvent(event);

      setUserProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setPendingEquipId(equippedAvatarId);
    setMessage({ type: '', text: '' });
  };

  const getAvatarImage = (avatarId) => {
    const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
    return found?.image || AVATAR_SHOP_ITEMS[0]?.image || '';
  };

  const getAvatarName = (avatarId) => {
    const found = AVATAR_SHOP_ITEMS.find(a => a.id === avatarId);
    return found?.name || 'Default';
  };

  const displayAvatarId = editMode && pendingEquipId ? pendingEquipId : equippedAvatarId;

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    if (AVATAR_SHOP_ITEMS[0]?.image) {
      e.target.src = AVATAR_SHOP_ITEMS[0].image;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={{ color: palette.bodyTextSoft, fontWeight: 600, fontFamily: FONT_BODY }}>Loading profile...</p>
      </div>
    );
  }

  const avatarActions = !editMode ? (
    <button
      onClick={() => setEditMode(true)}
      style={styles.editProfileButton}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 3px 0 ${palette.warmOrangeShadow}`; }}
    >
      <Icon name="pencil" size={14} color={palette.white} />
      Edit Profile
    </button>
  ) : (
    <div className="profile-edit-actions" style={styles.editActions}>
      <button onClick={handleCancelEdit} style={styles.cancelButton} disabled={saving}>
        Cancel
      </button>
      <button onClick={handleSaveProfile} style={styles.saveButton} disabled={saving}>
        {saving ? 'Saving...' : (
          <>
            <Icon name="check" size={13} color={palette.white} />
            Save
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="profile-container" style={styles.container}>
      <style>{`
        .profile-container * { box-sizing: border-box; }
        .profile-avatar-option { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .profile-avatar-option:hover { transform: translateY(-3px) scale(1.04); }
        .profile-avatar-option.locked { cursor: not-allowed !important; }
        .profile-avatar-option.locked:hover { transform: none !important; }
        .profile-info-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .profile-info-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px ${palette.shadowMd}; }
        @media (max-width: 768px) {
          .profile-container { padding: 16px !important; }
          .profile-header { flex-wrap: wrap !important; gap: 12px !important; }
          .profile-header h1 { font-size: 20px !important; }
          .profile-content { grid-template-columns: 1fr !important; gap: 16px !important; }
          .profile-avatar-section { padding: 20px 16px !important; }
          .profile-avatar { width: 140px !important; height: 140px !important; }
          .profile-avatar-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }
          .profile-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .profile-stats-grid .stat-card { padding: 14px 10px !important; }
          .profile-stats-grid .stat-card .stat-value { font-size: 20px !important; }
          .profile-edit-actions { flex-wrap: wrap !important; justify-content: center !important; }
          .profile-info-card { padding: 16px !important; }
        }
        @media (max-width: 480px) {
          .profile-container { padding: 12px !important; }
          .profile-header h1 { font-size: 18px !important; }
          .profile-avatar { width: 120px !important; height: 120px !important; }
          .profile-avatar-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .profile-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div className="profile-header" style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <Icon name="arrowLeft" size={13} color={palette.deepNavy} />
          Back
        </button>
        <h1 style={styles.title}>My Profile</h1>
        <span style={styles.headerSpacer} />
      </div>

      {message.text && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? `${palette.success}12` : `${palette.danger}12`,
          color: message.type === 'success' ? palette.success : palette.danger,
          borderColor: message.type === 'success' ? `${palette.success}40` : `${palette.danger}40`,
        }}>
          {message.type === 'success' ? (
            <Icon name="check" size={14} color={palette.success} />
          ) : (
            <Icon name="lock" size={14} color={palette.danger} />
          )}
          {message.text}
        </div>
      )}

      <div className="profile-content" style={styles.content}>
        {/* Avatar Section */}
        <div className="profile-avatar-section" style={styles.avatarSection}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatarRing}>
              <img
                src={getAvatarImage(displayAvatarId)}
                alt="Profile"
                className="profile-avatar"
                style={styles.avatar}
                onError={handleImageError}
                key={displayAvatarId}
              />
            </div>
            {typeof userProfile?.streak === 'number' && (
              <span style={styles.streakBadge} title="Day streak">
                <Icon name="flame" size={10} color="#FFC470" />
                {userProfile.streak}
              </span>
            )}
          </div>

          <p style={styles.avatarName}>{formData.displayName || 'Player'}</p>
          <p style={styles.avatarHandle}>@{formData.username || 'set-a-username'}</p>

          <div style={styles.equippedInfo}>
            <span style={styles.equippedLabel}>
              <Icon name="star" size={10} color={palette.warmOrange} />
              {editMode ? 'Preview' : 'Equipped'}
            </span>
            <span style={styles.equippedName}>{getAvatarName(displayAvatarId)}</span>
          </div>

          {editMode && (
            <div style={styles.avatarPickerWrap}>
              <p style={styles.avatarPickerTitle}>Choose your character</p>
              <div className="profile-avatar-grid" style={styles.avatarGrid}>
                {AVATAR_SHOP_ITEMS.map((avatar) => {
                  const isOwned = ownedAvatars.includes(avatar.id);
                  const isEquipped = equippedAvatarId === avatar.id;
                  const isSelected = pendingEquipId === avatar.id;
                  const rarityConfig = RARITY_CONFIG?.[avatar.rarity] || { color: palette.warmOrange, border: palette.border };

                  return (
                    <button
                      key={avatar.id}
                      className={`profile-avatar-option ${!isOwned ? 'locked' : ''}`}
                      onClick={() => handleSelectAvatar(avatar.id)}
                      disabled={!isOwned}
                      title={
                        isOwned
                          ? `${avatar.name} — ${avatar.rarity}`
                          : `${avatar.name} — Not owned (${avatar.price} pts)`
                      }
                      style={{
                        ...styles.avatarOption,
                        border: isSelected
                          ? `2.5px solid ${palette.warmOrange}`
                          : isEquipped
                            ? `2.5px solid ${palette.success}`
                            : `1.5px solid ${rarityConfig.border || palette.border}`,
                        background: isSelected
                          ? `${palette.warmOrange}12`
                          : isEquipped
                            ? `${palette.success}12`
                            : palette.creamSoft,
                        opacity: isOwned ? 1 : 0.45,
                        boxShadow: isSelected ? `0 2px 0 ${palette.warmOrange}40` : 'none',
                      }}
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        style={{
                          ...styles.avatarThumb,
                          filter: isOwned
                            ? 'none'
                            : 'grayscale(1) brightness(0.7)',
                        }}
                        onError={handleImageError}
                      />
                      {!isOwned && (
                        <span style={styles.lockBadge}>
                          <Icon name="lock" size={9} color={palette.white} />
                        </span>
                      )}
                      {isEquipped && (
                        <span style={styles.checkBadge}>
                          <Icon name="check" size={9} color={palette.white} />
                        </span>
                      )}
                      {isSelected && !isEquipped && (
                        <span style={styles.selectBadge}>●</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p style={styles.pickerHint}>
                Locked avatars are not owned yet. Visit the Avatar Shop to unlock them.
              </p>
            </div>
          )}

          <div style={styles.avatarActionsWrap}>
            {avatarActions}
          </div>

          {!editMode && (
            <button
              onClick={() => {
                const evt = new CustomEvent('openAvatarShop');
                window.dispatchEvent(evt);
              }}
              style={styles.shopButton}
            >
              <Icon name="shop" size={13} color={palette.warmOrange} />
              Change in Avatar Shop
            </button>
          )}
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Basic Info */}
          <div className="profile-info-card" style={styles.infoCard}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionEyebrow}>01</span>
              Basic Information
            </h2>
            <div style={styles.infoRow}>
              <label style={styles.label}>Display Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter display name"
                />
              ) : (
                <p style={styles.infoValue}>{formData.displayName || 'Not set'}</p>
              )}
            </div>
            <div style={styles.infoRow}>
              <label style={styles.label}>Username</label>
              {editMode ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter username"
                />
              ) : (
                <p style={styles.infoValue}>@{formData.username || 'Not set'}</p>
              )}
            </div>
            <div style={styles.infoRow}>
              <label style={styles.label}>Email</label>
              <p style={styles.infoValue}>{formData.email}</p>
            </div>
            <div style={{ ...styles.infoRow, marginBottom: 0 }}>
              <label style={styles.label}>Bio</label>
              {editMode ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p style={styles.infoValue}>{formData.bio || 'No bio yet'}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="profile-info-card" style={styles.infoCard}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionEyebrow}>02</span>
              Contact Information
            </h2>
            <div style={styles.infoRow}>
              <label style={styles.label}>Phone</label>
              {editMode ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter phone number"
                />
              ) : (
                <p style={styles.infoValue}>{formData.phone || 'Not set'}</p>
              )}
            </div>
            <div style={styles.infoRow}>
              <label style={styles.label}>Location</label>
              {editMode ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter location"
                />
              ) : (
                <p style={styles.infoValue}>{formData.location || 'Not set'}</p>
              )}
            </div>
            <div style={{ ...styles.infoRow, marginBottom: 0 }}>
              <label style={styles.label}>Website</label>
              {editMode ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="https://example.com"
                />
              ) : (
                <p style={styles.infoValue}>{formData.website || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="profile-info-card" style={styles.infoCard}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionEyebrow}>03</span>
              Social Links
            </h2>
            <div style={styles.infoRow}>
              <label style={styles.label}>Twitter</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  style={styles.input}
                  placeholder="@username"
                />
              ) : (
                <p style={styles.infoValue}>{formData.socialLinks.twitter || 'Not set'}</p>
              )}
            </div>
            <div style={styles.infoRow}>
              <label style={styles.label}>Instagram</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleSocialChange('instagram', e.target.value)}
                  style={styles.input}
                  placeholder="@username"
                />
              ) : (
                <p style={styles.infoValue}>{formData.socialLinks.instagram || 'Not set'}</p>
              )}
            </div>
            <div style={{ ...styles.infoRow, marginBottom: 0 }}>
              <label style={styles.label}>LinkedIn</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  style={styles.input}
                  placeholder="profile-url"
                />
              ) : (
                <p style={styles.infoValue}>{formData.socialLinks.linkedin || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="profile-info-card" style={styles.infoCard}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionEyebrow}>04</span>
              Settings
            </h2>
            <div style={styles.infoRow}>
              <label style={styles.label}>Email Notifications</label>
              {editMode ? (
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    style={{ accentColor: palette.warmOrange, width: 16, height: 16 }}
                  />
                  Receive notifications
                </label>
              ) : (
                <p style={{ ...styles.infoValue, ...(formData.settings.emailNotifications ? styles.pillOn : styles.pillOff) }}>
                  {formData.settings.emailNotifications ? 'Enabled' : 'Disabled'}
                </p>
              )}
            </div>
            <div style={styles.infoRow}>
              <label style={styles.label}>Dark Mode</label>
              {editMode ? (
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                    style={{ accentColor: palette.warmOrange, width: 16, height: 16 }}
                  />
                  Enable dark mode
                </label>
              ) : (
                <p style={{ ...styles.infoValue, ...(formData.settings.darkMode ? styles.pillOn : styles.pillOff) }}>
                  {formData.settings.darkMode ? 'Enabled' : 'Disabled'}
                </p>
              )}
            </div>
            <div style={{ ...styles.infoRow, marginBottom: 0 }}>
              <label style={styles.label}>Language</label>
              {editMode ? (
                <select
                  value={formData.settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  style={styles.select}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              ) : (
                <p style={styles.infoValue}>
                  {formData.settings.language === 'en' ? 'English' :
                   formData.settings.language === 'es' ? 'Español' :
                   formData.settings.language === 'fr' ? 'Français' :
                   formData.settings.language === 'de' ? 'Deutsch' : formData.settings.language}
                </p>
              )}
            </div>
          </div>

          {/* Password Change */}
          {!editMode && (
            <div className="profile-info-card" style={styles.infoCard}>
              <div style={styles.passwordHeader}>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>
                  <span style={styles.sectionEyebrow}>05</span>
                  Password
                </h2>
                <button
                  className="profile-change-password-btn"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  style={styles.changePasswordButton}
                >
                  {showPasswordChange ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              {showPasswordChange && (
                <div className="profile-password-form" style={styles.passwordForm}>
                  <div style={styles.infoRow}>
                    <label style={styles.label}>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      style={styles.input}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div style={styles.infoRow}>
                    <label style={styles.label}>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      style={styles.input}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div style={{ ...styles.infoRow, marginBottom: 0 }}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      style={styles.input}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={updatePasswordHandler}
                    style={styles.updatePasswordButton}
                    disabled={saving}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats-section" style={styles.statsSection}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionEyebrow}>06</span>
          Account Statistics
        </h2>
        <div className="profile-stats-grid" style={styles.statsGrid}>
          <div className="stat-card" style={styles.statCard}>
            <div style={{ marginBottom: 10, display: 'flex', background: palette.creamSoft, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${palette.border}` }}>
              <Icon name="book" size={16} color={palette.warmOrange} />
            </div>
            <span className="stat-value" style={{ ...styles.statValue, color: palette.warmOrange }}>{userProfile?.wordsLearned || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Words Learned</span>
          </div>
          <div className="stat-card" style={styles.statCard}>
            <div style={{ marginBottom: 10, display: 'flex', background: palette.creamSoft, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${palette.border}` }}>
              <Icon name="game" size={16} color={palette.teal} />
            </div>
            <span className="stat-value" style={{ ...styles.statValue, color: palette.teal }}>{userProfile?.gamesPlayed || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Games Played</span>
          </div>
          <div className="stat-card" style={styles.statCard}>
            <div style={{ marginBottom: 10, display: 'flex', background: palette.creamSoft, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${palette.border}` }}>
              <Icon name="flame" size={16} color={palette.coral} />
            </div>
            <span className="stat-value" style={{ ...styles.statValue, color: palette.coral }}>{userProfile?.streak || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Day Streak</span>
          </div>
          <div className="stat-card" style={styles.statCard}>
            <div style={{ marginBottom: 10, display: 'flex', background: palette.creamSoft, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${palette.border}` }}>
              <Icon name="star" size={16} color="#d4af37" />
            </div>
            <span className="stat-value" style={{ ...styles.statValue, color: palette.softGreen }}>{userProfile?.totalPoints || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Total Points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0',
    fontFamily: FONT_BODY,
    background: 'transparent',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${palette.border}`,
    borderTop: `3px solid ${palette.warmOrange}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: `1.5px solid ${palette.border}`,
  },
  backButton: {
    background: palette.white,
    border: `1.5px solid ${palette.border}`,
    padding: '8px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    color: palette.deepNavy,
    fontWeight: '800',
    fontFamily: FONT_DISPLAY,
    boxShadow: `0 2px 0 ${palette.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
  },
  headerSpacer: {
    width: '76px',
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: '24px',
    fontWeight: '800',
    color: palette.deepNavy,
    margin: '0',
    letterSpacing: '-0.5px',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1.5px solid',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: FONT_BODY,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '20px',
    marginBottom: '20px',
    alignItems: 'start',
  },
  avatarSection: {
    background: palette.white,
    borderRadius: '16px',
    padding: '24px 20px',
    border: `1.5px solid ${palette.border}`,
    textAlign: 'center',
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  avatarContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  avatarRing: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    padding: '4px',
    background: `conic-gradient(from 220deg, ${palette.warmOrange}, ${palette.coral}, ${palette.teal}, ${palette.warmOrange})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(42, 40, 69, 0.10)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'contain',
    objectPosition: 'center',
    border: `3px solid ${palette.white}`,
    display: 'block',
    background: palette.creamSoft,
  },
  streakBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: 'calc(50% - 80px - 6px)',
    background: palette.deepNavy,
    color: '#FFC470',
    fontFamily: FONT_MONO,
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '999px',
    border: `2px solid ${palette.white}`,
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  avatarName: {
    fontFamily: FONT_DISPLAY,
    fontSize: '18px',
    fontWeight: '800',
    color: palette.deepNavy,
    margin: '2px 0 2px',
  },
  avatarHandle: {
    fontFamily: FONT_MONO,
    fontSize: '12px',
    color: palette.bodyTextSoft,
    margin: '0 0 12px',
    fontWeight: 600,
  },
  equippedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '10px 12px',
    background: palette.creamSoft,
    borderRadius: '10px',
    marginBottom: '14px',
    border: `1.5px solid ${palette.border}`,
  },
  equippedLabel: {
    fontSize: '10px',
    color: palette.bodyTextSoft,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: FONT_DISPLAY,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  equippedName: {
    fontSize: '13px',
    color: palette.deepNavy,
    fontWeight: '700',
    fontFamily: FONT_BODY,
  },
  avatarActionsWrap: {
    marginTop: '8px',
  },
  shopButton: {
    width: '100%',
    marginTop: '8px',
    padding: '10px',
    background: 'transparent',
    color: palette.warmOrange,
    border: `1.5px dashed ${palette.warmOrange}`,
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: FONT_DISPLAY,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
  },
  avatarPickerWrap: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: `1.5px solid ${palette.border}`,
    textAlign: 'left',
  },
  avatarPickerTitle: {
    fontSize: '10px',
    fontWeight: '800',
    color: palette.bodyTextSoft,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: FONT_DISPLAY,
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  avatarOption: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '3px',
    background: palette.creamSoft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  },
  lockBadge: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    fontSize: '9px',
    background: 'rgba(42, 40, 69, 0.75)',
    borderRadius: '4px',
    padding: '2px 3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: '3px',
    right: '3px',
    color: 'white',
    background: palette.success,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1.5px solid ${palette.white}`,
  },
  selectBadge: {
    position: 'absolute',
    bottom: '3px',
    right: '3px',
    fontSize: '10px',
    color: 'white',
    background: palette.warmOrange,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    border: `1.5px solid ${palette.white}`,
  },
  pickerHint: {
    fontSize: '10px',
    color: palette.bodyTextSoft,
    marginTop: '10px',
    textAlign: 'center',
    lineHeight: 1.5,
    fontWeight: 600,
    fontFamily: FONT_BODY,
  },

  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  infoCard: {
    background: palette.white,
    borderRadius: '16px',
    padding: '20px 22px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  sectionTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: '14px',
    fontWeight: '800',
    color: palette.deepNavy,
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionEyebrow: {
    fontFamily: FONT_MONO,
    fontSize: '10px',
    color: palette.bodyTextSoft,
    fontWeight: '700',
    background: palette.creamSoft,
    padding: '2px 6px',
    borderRadius: '5px',
    border: `1px solid ${palette.border}`,
  },
  infoRow: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '800',
    color: palette.bodyTextSoft,
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: FONT_DISPLAY,
  },
  infoValue: {
    display: 'inline-block',
    fontSize: '14px',
    color: palette.deepNavy,
    margin: '0',
    padding: '2px 0',
    fontWeight: 700,
    fontFamily: FONT_BODY,
  },
  pillOn: {
    color: palette.success,
    fontWeight: '800',
    fontFamily: FONT_DISPLAY,
  },
  pillOff: {
    color: palette.bodyTextSoft,
    fontWeight: '700',
    fontFamily: FONT_DISPLAY,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${palette.border}`,
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: FONT_BODY,
    fontWeight: 600,
    background: palette.creamSoft,
    color: palette.deepNavy,
    transition: 'border-color 0.15s ease',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${palette.border}`,
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: FONT_BODY,
    fontWeight: 600,
    background: palette.creamSoft,
    color: palette.deepNavy,
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${palette.border}`,
    borderRadius: '10px',
    fontSize: '13px',
    backgroundColor: palette.creamSoft,
    color: palette.deepNavy,
    outline: 'none',
    fontFamily: FONT_BODY,
    fontWeight: 600,
    cursor: 'pointer',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: palette.bodyText,
    cursor: 'pointer',
    fontWeight: 600,
    fontFamily: FONT_BODY,
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  changePasswordButton: {
    padding: '6px 14px',
    background: palette.white,
    color: palette.warmOrange,
    border: `1.5px solid ${palette.warmOrange}`,
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: FONT_DISPLAY,
  },
  passwordForm: {
    marginTop: '16px',
    padding: '16px',
    background: palette.creamSoft,
    borderRadius: '12px',
    border: `1.5px solid ${palette.border}`,
  },
  updatePasswordButton: {
    width: '100%',
    padding: '12px',
    ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow),
    fontSize: '13px',
    marginTop: '10px',
  },
  editProfileButton: {
    width: '100%',
    padding: '12px',
    ...chunkyButton(palette.warmOrange, palette.warmOrangeShadow),
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  editActions: {
    display: 'flex',
    gap: '8px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: palette.white,
    border: `1.5px solid ${palette.border}`,
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: palette.deepNavy,
    fontWeight: '800',
    fontFamily: FONT_DISPLAY,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    ...chunkyButton(palette.softGreen, palette.softGreenShadow),
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  statsSection: {
    background: palette.white,
    borderRadius: '16px',
    padding: '20px 22px',
    border: `1.5px solid ${palette.border}`,
    boxShadow: `0 2px 0 ${palette.border}`,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '18px 12px',
    background: palette.creamSoft,
    borderRadius: '14px',
    border: `1.5px solid ${palette.border}`,
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  statValue: {
    fontFamily: FONT_DISPLAY,
    fontSize: '26px',
    fontWeight: '800',
    marginBottom: '2px',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '10px',
    color: palette.bodyTextSoft,
    fontWeight: '800',
    fontFamily: FONT_DISPLAY,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginTop: '4px',
  },
};

// Add animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Profile;