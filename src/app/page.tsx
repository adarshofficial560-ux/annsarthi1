'use client';

import React, { useState } from 'react';
import { useFoodRescue } from '../lib/store';
import { UserRole, FoodItemListing, NgoEntity } from '../types/schema';
import { Navbar } from '../components/Navbar';
import { AdminPortal } from '../components/AdminPortal';
import { KitchenPortal } from '../components/KitchenPortal';
import { NgoPortal } from '../components/NgoPortal';
import { ProcessingPortal } from '../components/ProcessingPortal';
import { AddFoodModal } from '../components/AddFoodModal';
import { SmsSimulatorModal } from '../components/SmsSimulatorModal';
import { EsgReportModal } from '../components/EsgReportModal';
import { LiveRedistributionMap } from '../components/LiveRedistributionMap';
import { IotMonitoringModal } from '../components/IotMonitoringModal';
import { SihDemoModal } from '../components/SihDemoModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { LoginForm } from '../components/LoginForm';
import { OfflineSyncBar } from '../components/OfflineSyncBar';

export default function HomePage() {
  const { currentUser, switchRole } = useFoodRescue();
  const [activePortal, setActivePortal] = useState<UserRole>('ADMIN');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isEsgModalOpen, setIsEsgModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [isSihDemoModalOpen, setIsSihDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Confirmation Workflow Modal State
  const [confirmListing, setConfirmListing] = useState<FoodItemListing | null>(null);
  const [confirmNgo, setConfirmNgo] = useState<NgoEntity | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSelectPortal = (role: UserRole) => {
    setActivePortal(role);
    switchRole(role);
  };

  const handleOpenConfirmation = (listing: FoodItemListing) => {
    setConfirmListing(listing);
    setConfirmNgo({
      id: 'ngo-1',
      name: 'Asha Community Shelter',
      activeBeneficiaries: 120,
      coldStorageAvailable: true,
      distanceKm: 3.2,
      urgencyLevel: 'CRITICAL_SOS',
      dietaryAccepted: ['VEGETARIAN', 'VEGAN', 'JAIN'],
      shelterType: 'Night Shelter & Children Home',
      lat: 22.2615,
      lng: 84.8520,
      contactPerson: 'Sister Teresa',
      phone: '+91 98201 44521',
      dailyIntakeCapacityKg: 120,
      currentIntakeKg: 45,
    });
    setIsConfirmModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#04120c] p-3 sm:p-6 flex flex-col gap-4 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Global Navigation Bar */}
      <Navbar
        activePortal={activePortal}
        onSelectPortal={handleSelectPortal}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSmsModal={() => setIsSmsModalOpen(true)}
        onOpenMapModal={() => setIsMapModalOpen(true)}
        onOpenEsgModal={() => setIsEsgModalOpen(true)}
        onOpenIotModal={() => setIsIotModalOpen(true)}
        onOpenSihDemoModal={() => setIsSihDemoModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Offline Sync Banner */}
      <OfflineSyncBar />

      {/* Main Active Dashboard Portal */}
      <main className="w-full transition-all duration-300">
        {activePortal === 'ADMIN' && (
          <AdminPortal
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenEsgModal={() => setIsEsgModalOpen(true)}
            onOpenSmsModal={() => setIsSmsModalOpen(true)}
            onOpenMapModal={() => setIsMapModalOpen(true)}
            onOpenIotModal={() => setIsIotModalOpen(true)}
          />
        )}

        {activePortal === 'KITCHEN' && (
          <KitchenPortal
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigateNgo={() => handleSelectPortal('NGO')}
            onOpenConfirmation={handleOpenConfirmation}
          />
        )}

        {activePortal === 'NGO' && (
          <NgoPortal
            onOpenLiveRadar={() => setIsMapModalOpen(true)}
          />
        )}

        {activePortal === 'PROCESSING_UNIT' && (
          <ProcessingPortal
            onOpenEsgModal={() => setIsEsgModalOpen(true)}
          />
        )}
      </main>

      {/* Modals Collection */}
      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <SmsSimulatorModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
      />

      <EsgReportModal
        isOpen={isEsgModalOpen}
        onClose={() => setIsEsgModalOpen(false)}
      />

      <LiveRedistributionMap
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

      <IotMonitoringModal
        isOpen={isIotModalOpen}
        onClose={() => setIsIotModalOpen(false)}
      />

      <SihDemoModal
        isOpen={isSihDemoModalOpen}
        onClose={() => setIsSihDemoModalOpen(false)}
        onOpenMap={() => setIsMapModalOpen(true)}
        onOpenEsg={() => setIsEsgModalOpen(true)}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        listing={confirmListing}
        targetNgo={confirmNgo}
      />

      <LoginForm
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(role) => handleSelectPortal(role)}
      />
    </div>
  );
}