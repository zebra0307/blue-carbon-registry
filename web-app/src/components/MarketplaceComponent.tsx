'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Shield,
  Star,
  DollarSign,
  Users
} from 'lucide-react';

interface MarketListing {
  id: string;
  projectName: string;
  projectId: string;
  seller: string;
  sellerRating: number;
  price: number;
  quantity: number;
  location: string;
  vintage: string;
  certification: string;
  verified: boolean;
  description: string;
  imageUrl?: string;
}

export default function MarketplaceComponent() {
  const { publicKey } = useWallet();
  
  const [listings] = useState<MarketListing[]>([
    {
      id: '1',
      projectName: 'Coastal Mangrove Restoration',
      projectId: 'BCP-001',
      seller: 'EcoRestore Foundation',
      sellerRating: 4.8,
      price: 14.25,
      quantity: 5000,
      location: 'Queensland, Australia',
      vintage: '2024',
      certification: 'Verra VCS',
      verified: true,
      description: 'High-quality blue carbon credits from verified mangrove restoration project.',
    },
    {
      id: '2',
      projectName: 'Seagrass Meadows Protection',
      projectId: 'BCP-002',
      seller: 'Blue Ocean Initiative',
      sellerRating: 4.6,
      price: 12.80,
      quantity: 2500,
      location: 'Florida Keys, USA',
      vintage: '2024',
      certification: 'Gold Standard',
      verified: true,
      description: 'Premium seagrass carbon credits with immediate delivery.',
    },
    {
      id: '3',
      projectName: 'Tidal Marsh Conservation',
      projectId: 'BCP-003',
      seller: 'Coastal Carbon Co.',
      sellerRating: 4.4,
      price: 11.50,
      quantity: 3800,
      location: 'Bay of Bengal, India',
      vintage: '2023',
      certification: 'Climate Action Reserve',
      verified: true,
      description: 'Bulk tidal marsh carbon credits available for corporate buyers.',
    },
    {
      id: '4',
      projectName: 'Kelp Forest Restoration',
      projectId: 'BCP-004',
      seller: 'Pacific Blue Carbon',
      sellerRating: 4.9,
      price: 16.75,
      quantity: 1200,
      location: 'California, USA',
      vintage: '2024',
      certification: 'Verra VCS',
      verified: true,
      description: 'Premium kelp forest carbon credits with enhanced biodiversity benefits.',
    },
  ]);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    certification: '',
    vintage: '',
    location: '',
    verifiedOnly: false,
  });

  const [sortBy, setSortBy] = useState('price-asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  const filteredListings = listings
    .filter(listing => {
      if (searchTerm && !listing.projectName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !listing.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.minPrice && listing.price < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && listing.price > parseFloat(filters.maxPrice)) return false;
      if (filters.certification && listing.certification !== filters.certification) return false;
      if (filters.vintage && listing.vintage !== filters.vintage) return false;
      if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.verifiedOnly && !listing.verified) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'quantity-asc': return a.quantity - b.quantity;
        case 'quantity-desc': return b.quantity - a.quantity;
        case 'rating-desc': return b.sellerRating - a.sellerRating;
        default: return 0;
      }
    });

  const handlePurchase = (listing: MarketListing) => {
    setSelectedListing(listing);
    setPurchaseQuantity(1);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (!publicKey || !selectedListing) return;
    
    // Here you would integrate with actual purchase logic
    alert(`Purchase confirmed: ${purchaseQuantity} credits from ${selectedListing.projectName} for $${(selectedListing.price * purchaseQuantity).toFixed(2)}`);
    setShowPurchaseModal(false);
    setSelectedListing(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-pink-25">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-black text-pink-700 tracking-tight">Carbon Credit Marketplace</h3>
              <p className="text-sm font-semibold text-pink-600 mt-1 tracking-wide">
                Buy and sell verified carbon credits from blue carbon projects
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm font-semibold transition-colors">
                <ShoppingCart className="h-4 w-4 inline mr-1" />
                My Orders
              </button>
              <button className="px-4 py-2 border border-pink-600 text-pink-600 rounded-lg hover:bg-pink-50 text-sm font-semibold transition-colors">
                List Credits
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, locations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={filters.certification}
                onChange={(e) => setFilters({...filters, certification: e.target.value})}
              >
                <option value="">All Certifications</option>
                <option value="Verra VCS">Verra VCS</option>
                <option value="Gold Standard">Gold Standard</option>
                <option value="Climate Action Reserve">Climate Action Reserve</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={filters.vintage}
                onChange={(e) => setFilters({...filters, vintage: e.target.value})}
              >
                <option value="">All Vintages</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="quantity-desc">Quantity: High to Low</option>
                <option value="rating-desc">Rating: High to Low</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min Price"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max Price"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
              />
              <span className="text-sm">Verified Only</span>
            </label>

            <div className="text-sm text-gray-600">
              {filteredListings.length} listings found
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{listing.projectName}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${listing.price}</div>
                  <div className="text-xs text-gray-500">per credit</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Seller:</span>
                  <div className="flex items-center">
                    <span className="font-medium">{listing.seller}</span>
                    <div className="flex items-center ml-2">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs ml-1">{listing.sellerRating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium">{listing.quantity.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vintage:</span>
                  <span className="font-medium">{listing.vintage}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Certification:</span>
                  <span className="font-medium">{listing.certification}</span>
                </div>
              </div>

              {listing.verified && (
                <div className="flex items-center mb-4">
                  <Shield className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Verified Project</span>
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4">{listing.description}</p>

              <button
                onClick={() => handlePurchase(listing)}
                className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold transition-colors"
                disabled={!publicKey}
              >
                {publicKey ? 'Buy Credits' : 'Connect Wallet to Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Purchase Carbon Credits</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-600">Project</label>
                <p className="font-medium">{selectedListing.projectName}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">Price per Credit</label>
                <p className="font-medium">${selectedListing.price}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 block mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedListing.quantity}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Math.min(parseInt(e.target.value) || 1, selectedListing.quantity))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(selectedListing.price * purchaseQuantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}