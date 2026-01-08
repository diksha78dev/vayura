'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { DistrictSearch } from '@/components/ui/district-search';
import { DistrictResults } from '@/components/ui/district-results';
import { formatCompactNumber } from '@/lib/utils/helpers';
import { DistrictSearchResult, DistrictDetail } from '@/lib/types';
import { TreeDeciduous, Heart, Wind } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    totalTreesPlanted: 0,
    totalTreesDonated: 0,
    totalTrees: 0,
    totalO2Impact: 0,
    verifiedContributions: 0,
  });
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSearchResult | null>(null);
  const [districtDetail, setDistrictDetail] = useState<DistrictDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [districtNotFound, setDistrictNotFound] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/?auth_required=true');
    }
  }, [user, loading, router]);

  // Fetch user contributions
  useEffect(() => {
    async function fetchUserStats() {
      if (!user) return;

      try {
        const response = await fetch(`/api/contribution?userId=${user.uid}&userEmail=${encodeURIComponent(user.email || '')}`);
        if (response.ok) {
          const data = await response.json();
          setUserStats({
            totalTreesPlanted: data.stats?.totalTreesPlanted || 0,
            totalTreesDonated: data.stats?.totalTreesDonated || 0,
            totalTrees: data.stats?.totalTrees || 0,
            totalO2Impact: data.stats?.totalO2Impact || 0,
            verifiedContributions: data.stats?.verifiedContributions || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    }
    fetchUserStats();
  }, [user]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-500"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header & Stats */}
          <section className="pt-20 pb-8 px-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                  Welcome back{user?.displayName ? `, ${user.displayName}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}
                </h1>
                <p className="text-gray-500 text-sm">
                  Search districts and track your environmental impact
                </p>
              </div>
            </div>

            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Trees Planted</h3>
                  <div className="bg-green-50 p-2 rounded-lg">
                    <TreeDeciduous className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{userStats.totalTreesPlanted}</p>
                  <span className="text-sm text-gray-500">trees</span>
                </div>
                <p className="text-xs text-green-600 mt-2 font-medium">
                  {userStats.verifiedContributions > 0 ? `${userStats.verifiedContributions} verified` : 'Start planting!'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Trees Donated</h3>
                  <div className="bg-amber-50 p-2 rounded-lg">
                    <Heart className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{userStats.totalTreesDonated}</p>
                  <span className="text-sm text-gray-500">supported</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Via trusted NGOs
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Lifetime Oxygen</h3>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Wind className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{formatCompactNumber(userStats.totalO2Impact)}</p>
                  <span className="text-sm text-gray-500">kg</span>
                </div>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  Estimated impact
                </p>
              </div>
            </div>
          </section>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-12">
            {/* Left Column - Search & Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* District Search Section */}
              <section>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Search District
                    </h2>
                    <p className="text-sm text-gray-500">
                      Get environmental insights and oxygen calculations
                    </p>
                  </div>

                  <DistrictSearch
                    onDistrictSelect={async (district) => {
                      setSelectedDistrict(district);
                      setLoadingDetail(true);
                      setDistrictDetail(null);
                      setDistrictNotFound(false);

                      try {
                        const response = await fetch(`/api/districts/${district.slug}`);
                        if (response.ok) {
                          const data = await response.json();
                          setDistrictDetail(data);
                          setDistrictNotFound(false);
                        } else if (response.status === 404) {
                          setDistrictNotFound(true);
                        } else {
                          console.error('Failed to load district details');
                          setDistrictNotFound(true);
                        }
                      } catch (error) {
                        console.error('Error loading district details:', error);
                        setDistrictNotFound(true);
                      } finally {
                        setLoadingDetail(false);
                      }
                    }}
                    districtNotFound={districtNotFound}
                    notFoundDistrictName={selectedDistrict?.name}
                    loadingDistrict={loadingDetail}
                  />
                </div>
              </section>

              {/* District Results Section */}
              {(selectedDistrict || loadingDetail) && (
                <section>
                  {loadingDetail ? (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-500">Loading district data...</p>
                    </div>
                  ) : districtDetail ? (
                    <DistrictResults data={districtDetail} />
                  ) : null}
                </section>
              )}
            </div>

            {/* Right Column - Quick Actions */}
            <div className="lg:col-span-1">
              <section className="sticky top-24">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Take Action
                    </h2>
                    <p className="text-sm text-gray-500">
                      Contribute to environmental restoration
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Plant a Tree */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Plant a Tree
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Upload proof of your tree plantation
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/plant')}
                        className="w-full px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Plant a Tree
                      </button>
                    </div>

                    {/* Donate Trees */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Donate Trees
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            Support verified NGOs to plant trees
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/donate')}
                        className="w-full px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Donate Now
                      </button>
                    </div>

                    {/* View Leaderboard */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">
                            Leaderboard
                          </h3>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            View state rankings and progress
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/leaderboard')}
                        className="w-full px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
                      >
                        View Rankings
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
