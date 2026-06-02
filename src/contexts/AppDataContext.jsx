import React, { createContext, useContext, useState, useEffect } from 'react';
import { foodListings as initialFood, bookings as initialBookings, reviews as initialReviews, donors as initialDonors, receivers as initialReceivers } from '../data/mockData';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [foodListings, setFoodListings] = useState(initialFood);
  const [bookings, setBookings] = useState(initialBookings);
  const [reviews, setReviews] = useState(initialReviews);
  const [donors, setDonors] = useState(initialDonors);
  const [receivers, setReceivers] = useState(initialReceivers);
  const [users, setUsers] = useState([]);
  const [banThreshold, setBanThreshold] = useState(30);

  const addFoodListing = (newFood) => {
    setFoodListings([newFood, ...foodListings]);
  };

  const addBooking = (newBooking) => {
    setBookings([newBooking, ...bookings]);
    // Update food status to claimed
    setFoodListings(prev => prev.map(f => f.id === newBooking.foodId ? { ...f, status: 'Claimed' } : f));
  };

  const cancelBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      setFoodListings(prev => prev.map(f => f.id === booking.foodId ? { ...f, status: 'Active' } : f));
    }
  };

  const addReview = (review) => {
    setReviews([...reviews, review]);
    setBookings(prev => prev.map(b => b.id === review.bookingId ? { ...b, reviewSubmitted: true } : b));
  };

  const updateBookingStatus = (bookingId, status) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    if (status === 'Completed') {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        setFoodListings(prev => prev.map(f => f.id === booking.foodId ? { ...f, status: 'Completed' } : f));
      }
    }
  };

  const updateReceiverAllergy = (receiverId, newProfile) => {
    setReceivers(prev => prev.map(r => r.id === receiverId ? { ...r, allergyProfile: newProfile } : r));
  };

  const updateBanThreshold = (val) => {
    setBanThreshold(val);
  };

  return (
    <AppDataContext.Provider value={{
      foodListings, addFoodListing,
      bookings, addBooking, cancelBooking,
      reviews, addReview,
      donors, setDonors,
      receivers, setReceivers, updateReceiverAllergy,
      banThreshold, updateBanThreshold,
      updateBookingStatus,
      users, setUsers
    }}>
      {children}
    </AppDataContext.Provider>
  );
};
