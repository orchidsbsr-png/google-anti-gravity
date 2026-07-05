import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import AddressForm from '../components/AddressForm';
import './Profile.css';

const iconProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

const Icons = {
    orders: (
        <svg {...iconProps}>
            <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
            <path d="M3.5 8.5L12 13l8.5-4.5" />
            <path d="M12 13v8" />
        </svg>
    ),
    admin: (
        <svg {...iconProps}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
    ),
    logout: (
        <svg {...iconProps}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    ),
    camera: (
        <svg {...iconProps} width={14} height={14}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
        </svg>
    ),
    edit: (
        <svg {...iconProps}>
            <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
    ),
    trash: (
        <svg {...iconProps}>
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
    ),
    phone: (
        <svg {...iconProps} width={13} height={13}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" />
        </svg>
    ),
    user: (
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20.5c1.5-3.5 4.2-5 7.5-5s6 1.5 7.5 5" />
        </svg>
    ),
    home: (
        <svg {...iconProps} width={13} height={13}>
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
        </svg>
    ),
};

const Profile = () => {
    const { addresses, deleteAddress, updateAddress, addAddress } = useAddress();
    const { logout, user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [profilePic, setProfilePic] = useState(localStorage.getItem('user_profile_pic') || user?.photoURL || null);

    const handleEdit = (address) => {
        setEditingAddress(address);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setIsEditing(true);
    };

    const handleSave = (addressData) => {
        if (editingAddress) {
            updateAddress(editingAddress.id, addressData);
        } else {
            addAddress(addressData);
        }
        setIsEditing(false);
        setEditingAddress(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingAddress(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setProfilePic(base64String);
                localStorage.setItem('user_profile_pic', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="profile-page">
            {/* Account header */}
            <header className="profile-hero">
                <div className="profile-pic-container">
                    <div className="avatar">
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="profile-img" />
                        ) : (
                            Icons.user
                        )}
                    </div>
                    <label htmlFor="profile-upload" className="edit-avatar-btn" title="Change photo">
                        {Icons.camera}
                    </label>
                    <input
                        type="file"
                        id="profile-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                <p className="profile-eyebrow">My Account</p>
                <h1 className="profile-name">{user?.name || 'Friend of the Orchard'}</h1>
                {user?.email && <p className="profile-email">{user.email}</p>}

                <div className="profile-actions">
                    <Link to="/orders" className="profile-action">
                        {Icons.orders} My Orders
                    </Link>
                    <Link to="/admin" className="profile-action">
                        {Icons.admin} Admin
                    </Link>
                    <button onClick={logout} className="profile-action logout">
                        {Icons.logout} Logout
                    </button>
                </div>
            </header>

            {/* Addresses */}
            <div className="section-title">
                <div>
                    <p className="section-eyebrow">Delivery</p>
                    <h2>Saved <em>Addresses</em></h2>
                </div>
                {!isEditing && (
                    <button className="add-address-btn" onClick={handleAddNew}>+ Add New</button>
                )}
            </div>

            {isEditing ? (
                <AddressForm
                    existingAddress={editingAddress}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : (
                <div className="address-list">
                    {addresses.length === 0 ? (
                        <div className="no-data">
                            <p className="no-data-line">No addresses yet &mdash; add one and your fruit will know the way home.</p>
                            <button className="btn-primary" onClick={handleAddNew}>Add an Address</button>
                        </div>
                    ) : (
                        addresses.map(addr => (
                            <div key={addr.id} className="address-card">
                                <div className="card-header">
                                    <span className="type-badge">{Icons.home} {addr.addressType}</span>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(addr)} aria-label="Edit address">{Icons.edit}</button>
                                        <button className="danger" onClick={() => deleteAddress(addr.id)} aria-label="Delete address">{Icons.trash}</button>
                                    </div>
                                </div>
                                <h3>{addr.name}</h3>
                                <p className="address-lines">
                                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                    <br />
                                    {addr.city}, {addr.state} &mdash; {addr.pincode}
                                </p>
                                <p className="address-phone">{Icons.phone} {addr.phone}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
