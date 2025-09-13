import React from 'react';

export default function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-blue-900">
              🌊 Blue Carbon Registry
            </h1>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Blue Carbon Registry</h2>
          <p className="text-blue-100">
            Manage carbon credits from blue carbon ecosystems on the Solana blockchain. 
            Register projects, mint credits, and trade verified environmental assets.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🏗️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      15
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🪙</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Credits Issued
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      125,430 tonnes
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📤</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Transferred
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      42,850 tonnes
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🔥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Retired
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      28,640 tonnes
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <span>🏗️</span>
              <span>Register Project</span>
            </button>
            <button className="bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <span>🪙</span>
              <span>Mint Credits</span>
            </button>
            <button className="bg-yellow-600 text-white py-4 px-6 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2">
              <span>📤</span>
              <span>Transfer Credits</span>
            </button>
            <button className="bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
              <span>🔥</span>
              <span>Retire Credits</span>
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Projects
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Latest registered blue carbon projects
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            <li>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold">🌊</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Mangrove Restoration Project
                      </div>
                      <div className="text-sm text-gray-500">
                        Pacific Coast, California • Registered 3 days ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        25,500 tonnes
                      </div>
                      <div className="text-sm text-gray-500">
                        Available Credits
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-bold">🌿</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Seagrass Conservation Initiative
                      </div>
                      <div className="text-sm text-gray-500">
                        Chesapeake Bay, Maryland • Registered 1 week ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        18,750 tonnes
                      </div>
                      <div className="text-sm text-gray-500">
                        Available Credits
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">🏞️</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Salt Marsh Ecosystem Restoration
                      </div>
                      <div className="text-sm text-gray-500">
                        San Francisco Bay, California • Registered 2 weeks ago
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        32,200 tonnes
                      </div>
                      <div className="text-sm text-gray-500">
                        Estimated Credits
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>🌊 Powered by Solana Blockchain • Built for Blue Carbon Ecosystems 🌿</p>
        </div>
      </main>
    </div>
  );
}