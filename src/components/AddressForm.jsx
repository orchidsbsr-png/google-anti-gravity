import React, { useState, useEffect } from 'react';
import { useAddress } from '../context/AddressContext';
import './AddressForm.css';

const AddressForm = ({ existingAddress, onSave, onCancel }) => {
    const { validateAddress } = useAddress();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        addressType: 'Home',
        isDefault: false
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (existingAddress) {
            setFormData(existingAddress);
        }
    }, [existingAddress]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));

        // Real-time validation if touched
        if (touched[name]) {
            const { errors: newErrors } = validateAddress({ ...formData, [name]: val });
            setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const { errors: newErrors } = validateAddress(formData);
        setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
    };

    const handleKeyDown = (e) => {
        // Prevent form submission on Enter key unless on submit button
        if (e.key === 'Enter' && e.target.type !== 'submit') {
            e.preventDefault();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { isValid, errors: submitErrors } = validateAddress(formData);

        if (isValid) {
            onSave(formData);
        } else {
            setErrors(submitErrors);
            setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        }
    };

    return (
        <form className="address-form glass" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <h3>{existingAddress ? 'Edit Address' : 'Add New Address'}</h3>

            <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
                <label>Pincode</label>
                <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength="6"
                    placeholder="6-digit pincode"
                    className={errors.pincode ? 'error' : ''}
                />
                {errors.pincode && <span className="error-text">{errors.pincode}</span>}
            </div>

            <div className="form-group">
                <label>Address Line 1 (House No, Building, Street)</label>
                <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.addressLine1 ? 'error' : ''}
                />
                {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
            </div>

            <div className="form-group">
                <label>Address Line 2 (Area, Colony)</label>
                <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>City</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                    <label>State</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="error-text">{errors.state}</span>}
                </div>
            </div>

            <div className="form-group">
                <label>Landmark (Optional)</label>
                <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Address Type</label>
                <div className="radio-group">
                    {['Home', 'Work', 'Other'].map(type => (
                        <label key={type} className="radio-label">
                            <input
                                type="radio"
                                name="addressType"
                                value={type}
                                checked={formData.addressType === type}
                                onChange={handleChange}
                            />
                            {type}
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary">Save Address</button>
            </div>
        </form>
    );
};

export default AddressForm;
