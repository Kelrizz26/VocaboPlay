import React, { useState, useEffect } from 'react';
import { auth, db } from '../pages/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import sound from '../utils/soundEffects';
import { colors, fontFamily } from './dashboard/dashboardStyles';

const Profile = ({ onBack }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const defaultAvatar = '/images/A1.png';

  const avatarOptions = [];
  for (let i = 1; i <= 24; i++) {
    const filename = `A${i}.png`;
    avatarOptions.push({
      id: i,
      filename: filename,
      path: `/images/${filename}`
    });
  }

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    avatarFilename: 'A1.png',
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

  // Load the display fonts used for the game-tag identity (falls back to
  // Poppins, which the rest of the app already loads, if the network is
  // unavailable).
  useEffect(() => {
    if (document.getElementById('vocabo-profile-fonts')) return;
    const link = document.createElement('link');
    link.id = 'vocabo-profile-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@500&display=swap';
    document.head.appendChild(link);
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
        const avatarFilename = firestoreData.avatar || 'A1.png';

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
          avatarFilename: avatarFilename,
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

  const handleAvatarSelect = (filename) => {
    setFormData(prev => ({
      ...prev,
      avatarFilename: filename
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
        avatar: formData.avatarFilename,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        socialLinks: formData.socialLinks,
        settings: formData.settings,
        updatedAt: new Date().toISOString()
      };

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

  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.src = '/images/A1.png';
  };

  const getCurrentAvatarPath = () => {
    return `/images/${formData.avatarFilename}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={{ color: colors.textSecondary }}>Loading profile...</p>
      </div>
    );
  }

  const avatarActions = !editMode ? (
    <button onClick={() => setEditMode(true)} style={styles.editProfileButton}>
      ✏️ Edit Profile
    </button>
  ) : (
    <div className="profile-edit-actions" style={styles.editActions}>
      <button onClick={() => setEditMode(false)} style={styles.cancelButton} disabled={saving}>
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
        .profile-edit-profile-btn:hover { background: #4638C2 !important; }
        .profile-change-password-btn:hover { background: #5B4FE8 !important; color: #fff !important; }
        .profile-avatar-option:hover { transform: scale(1.06); }
        @media (max-width: 768px) {
          .profile-container { padding: 16px !important; }
          .profile-header { flex-wrap: wrap !important; gap: 12px !important; }
          .profile-header h1 { font-size: 20px !important; }
          .profile-content { grid-template-columns: 1fr !important; gap: 16px !important; }
          .profile-avatar-section { padding: 20px 16px !important; }
          .profile-avatar { width: 96px !important; height: 96px !important; }
          .profile-avatar-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 4px !important; }
          .profile-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .profile-stats-grid .stat-card { padding: 14px 10px !important; }
          .profile-stats-grid .stat-card .stat-value { font-size: 20px !important; }
          .profile-edit-actions { flex-wrap: wrap !important; justify-content: center !important; }
          .profile-info-card { padding: 16px !important; }
        }
        @media (max-width: 480px) {
          .profile-container { padding: 12px !important; }
          .profile-header h1 { font-size: 18px !important; }
          .profile-avatar { width: 88px !important; height: 88px !important; }
          .profile-avatar-grid { grid-template-columns: repeat(3, 1fr) !important; }
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
          backgroundColor: message.type === 'success' ? `${colors.success}15` : `${colors.danger}15`,
          color: message.type === 'success' ? colors.success : colors.danger,
          borderColor: message.type === 'success' ? `${colors.success}40` : `${colors.danger}40`,
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
                src={getCurrentAvatarPath()}
                alt="Profile"
                className="profile-avatar"
                style={styles.avatar}
                onError={handleImageError}
                key={getCurrentAvatarPath()}
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

          {editMode && (
            <div style={styles.avatarOptions}>
              <p style={styles.avatarOptionsTitle}>Choose your avatar</p>
              <div className="profile-avatar-grid" style={styles.avatarGrid}>
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    className="profile-avatar-option"
                    onClick={() => handleAvatarSelect(avatar.filename)}
                    style={{
                      ...styles.avatarOption,
                      border: formData.avatarFilename === avatar.filename ? `3px solid ${colors.accent}` : '2px solid transparent',
                    }}
                  >
                    <img
                      src={avatar.path}
                      alt={`Avatar ${avatar.id}`}
                      style={styles.avatarThumb}
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={styles.avatarActionsWrap}>
            {avatarActions}
          </div>
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Basic Info */}
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: colors.accent }}>
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
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: colors.success }}>
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
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: '#F5A623' }}>
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
          <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: colors.accent }}>
            <h2 style={styles.sectionTitle}><span style={styles.sectionEyebrow}>04</span>Settings</h2>
            <div style={styles.infoRow}>
              <label style={styles.label}>Email Notifications</label>
              {editMode ? (
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
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
            <div className="profile-info-card" style={{ ...styles.infoCard, borderTopColor: colors.success }}>
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
                  <button onClick={updatePasswordHandler} style={styles.updatePasswordButton} disabled={saving}>
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
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: colors.accent }}>
            <span className="stat-icon" style={styles.statIcon}>📚</span>
            <span className="stat-value" style={{ ...styles.statValue, color: colors.accent }}>{userProfile?.wordsLearned || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Words Learned</span>
          </div>
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: '#8B5CF6' }}>
            <span className="stat-icon" style={styles.statIcon}>🎮</span>
            <span className="stat-value" style={{ ...styles.statValue, color: '#8B5CF6' }}>{userProfile?.gamesPlayed || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Games Played</span>
          </div>
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: '#F5A623' }}>
            <span className="stat-icon" style={styles.statIcon}>🔥</span>
            <span className="stat-value" style={{ ...styles.statValue, color: '#E08E00' }}>{userProfile?.streak || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Day Streak</span>
          </div>
          <div className="stat-card" style={{ ...styles.statCard, ['--stat-accent']: colors.success }}>
            <span className="stat-icon" style={styles.statIcon}>⭐</span>
            <span className="stat-value" style={{ ...styles.statValue, color: colors.success }}>{userProfile?.totalPoints || 0}</span>
            <span className="stat-label" style={styles.statLabel}>Total Points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FONT_DISPLAY = "'Fredoka', 'Poppins', sans-serif";
const FONT_BODY = "'Poppins', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Poppins', monospace";

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: FONT_BODY,
    background: colors.bg,
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
    border: `2px solid ${colors.border}`,
    borderTop: `2px solid ${colors.accent}`,
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
    borderBottom: `1px solid ${colors.border}`,
  },
  backButton: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    padding: '8px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: '68px',
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: '22px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: '0',
  },
  message: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '20px',
    fontSize: '13px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: '20px',
    marginBottom: '20px',
    alignItems: 'start',
  },
  avatarSection: {
    background: colors.surface,
    borderRadius: '18px',
    padding: '24px 20px',
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
  },
  avatarContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  avatarRing: {
    width: '112px',
    height: '112px',
    borderRadius: '50%',
    padding: '3px',
    background: `conic-gradient(from 220deg, ${colors.accent}, #8B5CF6, #F5A623, ${colors.accent})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `3px solid ${colors.surface}`,
    display: 'block',
  },
  streakBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: 'calc(50% - 56px - 6px)',
    background: colors.textPrimary,
    color: '#FFC470',
    fontFamily: FONT_MONO,
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '999px',
    border: `2px solid ${colors.surface}`,
  },
  avatarName: {
    fontFamily: FONT_DISPLAY,
    fontSize: '17px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: '2px 0 2px',
  },
  avatarHandle: {
    fontFamily: FONT_MONO,
    fontSize: '12px',
    color: colors.textMuted,
    margin: '0 0 4px',
  },
  avatarOptions: {
    borderTop: `1px solid ${colors.border}`,
    marginTop: '14px',
    paddingTop: '14px',
    textAlign: 'left',
  },
  avatarOptionsTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '6px',
  },
  avatarOption: {
    aspectRatio: '1',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: '2px',
    background: 'transparent',
    transition: 'transform 0.12s ease',
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarActionsWrap: {
    marginTop: '16px',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  infoCard: {
    background: colors.surface,
    borderRadius: '16px',
    padding: '18px 20px',
    border: `1px solid ${colors.border}`,
    borderTop: `3px solid ${colors.accent}`,
  },
  sectionTitle: {
    fontFamily: FONT_DISPLAY,
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textPrimary,
    margin: '0 0 14px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionEyebrow: {
    fontFamily: FONT_MONO,
    fontSize: '10px',
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoRow: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  infoValue: {
    display: 'inline-block',
    fontSize: '14px',
    color: colors.textPrimary,
    margin: '0',
    padding: '2px 0',
  },
  pillOn: {
    color: colors.success,
    fontWeight: '600',
  },
  pillOff: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '9px',
    fontSize: '13px',
    outline: 'none',
    fontFamily: FONT_BODY,
    background: colors.bg,
    color: colors.textPrimary,
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '9px',
    fontSize: '13px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: FONT_BODY,
    background: colors.bg,
    color: colors.textPrimary,
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '9px',
    fontSize: '13px',
    backgroundColor: colors.bg,
    color: colors.textPrimary,
    outline: 'none',
    fontFamily: FONT_BODY,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: colors.textSecondary,
    cursor: 'pointer',
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  changePasswordButton: {
    padding: '6px 14px',
    background: colors.surface,
    color: colors.accent,
    border: `1.5px solid ${colors.accent}`,
    borderRadius: '9px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.12s ease, color 0.12s ease',
  },
  passwordForm: {
    marginTop: '14px',
    padding: '14px',
    background: colors.bg,
    borderRadius: '12px',
  },
  updatePasswordButton: {
    width: '100%',
    padding: '10px',
    background: colors.accent,
    color: 'white',
    border: 'none',
    borderRadius: '9px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  editProfileButton: {
    width: '100%',
    padding: '11px',
    background: colors.accent,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: FONT_BODY,
  },
  editActions: {
    display: 'flex',
    gap: '8px',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: colors.textPrimary,
  },
  saveButton: {
    flex: 1,
    padding: '10px',
    background: colors.success,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  statsSection: {
    background: colors.surface,
    borderRadius: '18px',
    padding: '20px',
    border: `1px solid ${colors.border}`,
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
    background: colors.bg,
    borderRadius: '14px',
    border: `1px solid ${colors.border}`,
    borderTop: '3px solid var(--stat-accent)',
  },
  statIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  statValue: {
    fontFamily: FONT_DISPLAY,
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '2px',
  },
  statLabel: {
    fontSize: '11px',
    color: colors.textMuted,
    fontWeight: '500',
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