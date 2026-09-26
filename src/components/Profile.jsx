import React, { useState, useEffect } from 'react';
import { auth, db } from '../pages/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import sound from '../utils/soundEffects';
import { colors, fontFamily } from './dashboard/dashboardStyles';
import { AVATAR_SHOP_ITEMS, RARITY_CONFIG, DEFAULT_AVATAR_ID } from '../data/avatarShop';

// ===== WARM & FRIENDLY PALETTE (Matched to Mascots) =====
const palette = {
  warmOrange: '#F4A261',
  warmOrangeShadow: '#C77E3E',
  coral: '#E76F51',
  coralShadow: '#B54A32',
  teal: '#2A9D8F',
  tealShadow: '#1E7268',
  deepNavy: '#2D2A5E',
  bodyText: '#5A587A',
  cream: '#FFF8F0',
  white: '#FFFFFF',
  border: '#E2E8F0',
  softGreen: '#8AB17D',
  softGreenShadow: '#6A8A5E',
  success: '#8AB17D',
  danger: '#E76F51',
};

const FONT_DISPLAY = "'Fredoka', sans-serif";
const FONT_BODY = "'Nunito', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Nunito', monospace";

const chunkyButton = (bg, shadowColor) => ({
  background: bg,
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '800',
  cursor: 'pointer',
  boxShadow: `0 4px 0 ${shadowColor}, 0 6px 14px rgba(45,42,94,0.18)`,
  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  fontFamily: FONT_DISPLAY,
});

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
      setMessage({ type: 'error', text: '❌ Hindi mo pa owned yan! Bisitahin ang Avatar Shop.' });
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
        <p style={{ color: palette.bodyText, fontWeight: 600, fontFamily: FONT_BODY }}>Loading profile...</p>
      </div>
    );
  }

  const avatarActions = !editMode ? (
    <button
      onClick={() => setEditMode(true)}
      style={styles.editProfileButton}
    >
      ✏️ Edit Profile
    </button>
  ) : (
    <div className="profile-edit-actions" style={styles.editActions}>
      <button onClick={handleCancelEdit} style={styles.cancelButton} disabled={saving}>
        Cancel
      </button>
      <button onClick={handleSaveProfile} style={styles.saveButton} disabled={saving}>
        {saving ? 'Saving...' : '💾 Save'}
      </button>
    </div>
  );

  return (
    <div className="profile-container" style={styles.container}>
      <style>{`
        .profile-container * { box-sizing: border-box; }
        .profile-avatar-option { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .profile-avatar-option:hover { transform: translateY(-3px) scale(1.05); }
        .profile-avatar-option.locked { cursor: not-allowed !important; }
        .profile-avatar-option.locked:hover { transform: none !important; }
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
        <button onClick={onBack} style={styles.backButton}>← Back</button>
        <h1 style={styles.title}>My Profile</h1>
        <span style={styles.headerSpacer} />
      </div>

      {message.text && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? `${palette.success}18` : `${palette.danger}18`,
          color: message.type === 'success' ? palette.success : palette.danger,
          borderColor: message.type === 'success' ? `${palette.success}50` : `${palette.danger}50`,
        }}>
          {message.type === 'success' ? '✓ ' : '⚠ '}{message.text}
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
                🔥 {userProfile.streak}
              </span>
            )}
          </div>

          <p style={styles.avatarName}>{formData.displayName || 'Player'}</p>
          <p style={styles.avatarHandle}>@{formData.username || 'set-a-username'}</p>

          <div style={styles.equippedInfo}>
            <span style={styles.equippedLabel}>🎨 {editMode ? 'Preview:' : 'Equipped:'}</span>
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
                          : `${avatar.name} — 🔒 Not owned (${avatar.price} pts)`
                      }
                      style={{
                        ...styles.avatarOption,
                        border: isSelected
                          ? `3px solid ${palette.warmOrange}`
                          : isEquipped
                            ? `3px solid ${palette.success}`
                            : `2px solid ${rarityConfig.border || palette.border}`,
                        background: isSelected
                          ? palette.cream
                          : isEquipped
                            ? `${palette.success}18`
                            : palette.cream,
                        opacity: isOwned ? 1 : 0.45,
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
                        <span style={styles.lockBadge}>🔒</span>
                      )}
                      {isEquipped && (
                        <span style={styles.checkBadge}>✓</span>
                      )}
                      {isSelected && !isEquipped && (
                        <span style={styles.selectBadge}>●</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p style={styles.pickerHint}>
                🔒 Locked = hindi pa owned. Bisitahin ang Avatar Shop para bilhin.
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
              🛍️ Change in Avatar Shop
            </button>
          )}
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Basic Info */}
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: palette.warmOrange }}>
            <h2 style={styles.sectionTitle}><span style={styles.sectionEyebrow}>01</span>Basic Information</h2>
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
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: palette.teal }}>
            <h2 style={styles.sectionTitle}><span style={styles.sectionEyebrow}>02</span>Contact Information</h2>
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
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: palette.coral }}>
            <h2 style={styles.sectionTitle}><span style={styles.sectionEyebrow}>03</span>Social Links</h2>
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
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: palette.warmOrange }}>
            <h2 style={styles.sectionTitle}><span style={styles.sectionEyebrow}>04</span>Settings</h2>
            <div style={styles.infoRow}>
              <label style={styles.label}>Email Notifications</label>
              {editMode ? (
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    style={{ accentColor: palette.warmOrange }}
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
                    style={{ accentColor: palette.warmOrange }}
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
            <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: palette.teal }}>
              <div style={styles.passwordHeader}>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}><span style={styles.sectionEyebrow}>05</span>Password</h2>
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
        <h2 style={styles.sectionTitle}>Account Statistics</h2>
        <div className="profile-stats-grid" style={styles.statsGrid}>
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: palette.warmOrange }}>
            <span className="stat-icon" style={styles.statIcon}>📚</span>
            <span className="stat-value" style={{ ...styles.statValue, color: palette.warmOrange }}>{userProfile?.wordsLearned || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Words Learned</span>
          </div>
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: palette.teal }}>
            <span className="stat-icon" style={styles.statIcon}>🎮</span>
            <span className="stat-value" style={{ ...styles.statValue, color: palette.teal }}>{userProfile?.gamesPlayed || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Games Played</span>
          </div>
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: palette.coral }}>
            <span className="stat-icon" style={styles.statIcon}>🔥</span>
            <span className="stat-value" style={{ ...styles.statValue, color: palette.coral }}>{userProfile?.streak || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Day Streak</span>
          </div>
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: palette.softGreen }}>
            <span className="stat-icon" style={styles.statIcon}>⭐</span>
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
    padding: '24px',
    fontFamily: FONT_BODY,
    background: palette.cream,
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
    border: `4px solid ${palette.border}`,
    borderTop: `4px solid ${palette.warmOrange}`,
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
    borderBottom: `2px solid ${palette.border}`,
  },
  backButton: {
    background: palette.white,
    border: `2px solid ${palette.border}`,
    padding: '8px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: palette.deepNavy,
    fontWeight: '700',
    fontFamily: FONT_DISPLAY,
    boxShadow: `0 3px 0 ${palette.border}`,
  },
  headerSpacer: {
    width: '68px',
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
    border: '2px solid',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: 700,
    fontFamily: FONT_BODY,
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
    borderRadius: '20px',
    padding: '24px 20px',
    border: `2px solid ${palette.border}`,
    textAlign: 'center',
    boxShadow: '0 6px 20px rgba(244, 162, 97, 0.10)',
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
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'contain',
    objectPosition: 'center',
    border: `3px solid ${palette.white}`,
    display: 'block',
    background: palette.cream,
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
    color: palette.bodyText,
    margin: '0 0 8px',
    fontWeight: 600,
  },
  equippedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px 10px',
    background: palette.cream,
    borderRadius: '10px',
    marginBottom: '14px',
    border: `2px solid ${palette.border}`,
  },
  equippedLabel: {
    fontSize: '10px',
    color: palette.bodyText,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    fontFamily: FONT_DISPLAY,
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
    border: `2px dashed ${palette.warmOrange}`,
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    fontFamily: FONT_DISPLAY,
  },
  avatarPickerWrap: {
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: `2px solid ${palette.border}`,
    textAlign: 'left',
  },
  avatarPickerTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: palette.bodyText,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
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
    borderRadius: '12px',
    cursor: 'pointer',
    padding: '4px',
    background: palette.cream,
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
    top: '4px',
    right: '4px',
    fontSize: '12px',
    background: 'rgba(45, 42, 94, 0.7)',
    borderRadius: '6px',
    padding: '1px 4px',
  },
  checkBadge: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    fontSize: '10px',
    color: 'white',
    background: palette.success,
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  selectBadge: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
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
  },
  pickerHint: {
    fontSize: '10px',
    color: palette.bodyText,
    marginTop: '10px',
    textAlign: 'center',
    lineHeight: 1.4,
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
    borderRadius: '18px',
    padding: '18px 20px',
    border: `2px solid ${palette.border}`,
    borderTop: `3px solid ${palette.warmOrange}`,
    boxShadow: '0 6px 18px rgba(244, 162, 97, 0.08)',
  },
  sectionTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: '15px',
    fontWeight: '800',
    color: palette.deepNavy,
    margin: '0 0 14px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionEyebrow: {
    fontFamily: FONT_MONO,
    fontSize: '10px',
    color: palette.bodyText,
    fontWeight: '700',
    background: palette.cream,
    padding: '2px 6px',
    borderRadius: '6px',
  },
  infoRow: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '800',
    color: palette.bodyText,
    marginBottom: '4px',
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
    color: palette.bodyText,
    fontWeight: '700',
    fontFamily: FONT_DISPLAY,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `2px solid ${palette.border}`,
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: FONT_BODY,
    fontWeight: 600,
    background: palette.cream,
    color: palette.deepNavy,
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: `2px solid ${palette.border}`,
    borderRadius: '10px',
    fontSize: '13px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: FONT_BODY,
    fontWeight: 600,
    background: palette.cream,
    color: palette.deepNavy,
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: `2px solid ${palette.border}`,
    borderRadius: '10px',
    fontSize: '13px',
    backgroundColor: palette.cream,
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
    border: `2px solid ${palette.warmOrange}`,
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'background 0.12s ease, color 0.12s ease',
    fontFamily: FONT_DISPLAY,
  },
  passwordForm: {
    marginTop: '14px',
    padding: '14px',
    background: palette.cream,
    borderRadius: '12px',
    border: `2px solid ${palette.border}`,
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
  },
  editActions: {
    display: 'flex',
    gap: '8px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: palette.white,
    border: `2px solid ${palette.border}`,
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    color: palette.deepNavy,
    fontWeight: '800',
    fontFamily: FONT_DISPLAY,
    boxShadow: `0 3px 0 ${palette.border}`,
  },
  saveButton: {
    flex: 1,
    padding: '12px',
    ...chunkyButton(palette.softGreen, palette.softGreenShadow),
    fontSize: '13px',
  },
  statsSection: {
    background: palette.white,
    borderRadius: '20px',
    padding: '20px',
    border: `2px solid ${palette.border}`,
    boxShadow: '0 6px 18px rgba(244, 162, 97, 0.10)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '18px 12px',
    background: palette.cream,
    borderRadius: '16px',
    border: `2px solid ${palette.border}`,
    borderTop: `3px solid var(--stat-accent)`,
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
  },
  statLabel: {
    fontSize: '11px',
    color: palette.bodyText,
    fontWeight: '700',
    fontFamily: FONT_DISPLAY,
    textAlign: 'center',
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