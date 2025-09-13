import React from 'react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Blue Carbon Registry
            </h1>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Projects
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      12
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
                    <span className="text-white font-bold">C</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Credits Issued
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      45,230 tonnes
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
                    <span className="text-white font-bold">T</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Transferred
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      12,450 tonnes
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
                    <span className="text-white font-bold">R</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Retired
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      8,320 tonnes
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Register Project
            </button>
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Mint Credits
            </button>
            <button className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors">
              Transfer Credits
            </button>
            <button className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
              Retire Credits
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
              Latest registered carbon offset projects
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            <li>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold">MP</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Mangrove Protection Project
                      </div>
                      <div className="text-sm text-gray-500">
                        Pacific Coast, California
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                    <span className="text-sm text-gray-500">
                      12,500 tonnes
                    </span>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-bold">SR</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Seagrass Restoration Initiative
                      </div>
                      <div className="text-sm text-gray-500">
                        Chesapeake Bay, Maryland
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                    <span className="text-sm text-gray-500">
                      8,750 tonnes
                    </span>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold">WC</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        Wetland Conservation Project
                      </div>
                      <div className="text-sm text-gray-500">
                        Everglades, Florida
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                    <span className="text-sm text-gray-500">
                      15,200 tonnes
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
