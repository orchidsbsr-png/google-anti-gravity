import React, { useState } from 'react';
import { useAddress } from '../context/AddressContext';
import { useAuth } from '../context/AuthContext';
import AddressForm from '../components/AddressForm';
import './Profile.css';

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
            <div className="profile-header glass-strong">
                <div className="profile-pic-container">
                    <div className="avatar">
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="profile-img" />
                        ) : (
                            <span>👤</span>
                        )}
                    </div>
                    <label htmlFor="profile-upload" className="edit-avatar-btn">
                        📷
                    </label>
                    <input
                        type="file"
                        id="profile-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                </div>
                <div className="profile-info">
                    <h1>{user?.name || 'My Profile'}</h1>
                    <div className="profile-actions">
                        <a href="/admin" className="admin-link">Admin Dashboard</a>
                        <a href="/orders" className="orders-link" style={{ marginRight: '1rem', textDecoration: 'none', color: '#333', fontWeight: '600' }}>📦 My Orders</a>
                        <button onClick={logout} className="logout-link">Logout</button>
                    </div>
                </div>
            </div>

            <div className="section-title">
                <h2>My Addresses</h2>
                {!isEditing && (
                    <button className="btn-text" onClick={handleAddNew}>+ Add New</button>
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
                        <p className="no-data">No addresses saved yet.</p>
                    ) : (
                        addresses.map(addr => (
                            <div key={addr.id} className="address-card glass">
                                <div className="card-header">
                                    <span className="type-badge">{addr.addressType}</span>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(addr)}>✏️</button>
                                        <button onClick={() => deleteAddress(addr.id)}>🗑️</button>
                                    </div>
                                </div>
                                <h3>{addr.name}</h3>
                                <p>{addr.addressLine1}</p>
                                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p>📞 {addr.phone}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
