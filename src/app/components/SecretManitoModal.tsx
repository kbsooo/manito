import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

interface SecretManitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  manitoName: string;
  type: 'reveal' | 'assign';
}

export default function SecretManitoModal({ isOpen, onClose, manitoName, type }: SecretManitoModalProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-rose-50 border-none shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-rose-500 to-red-400 bg-clip-text text-transparent">
            {type === 'assign' ? '비밀 마니또' : '🎉 마니또 공개'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-8">
          {type === 'assign' && (
            <>
              <p className="text-gray-600 mb-6 text-center text-lg">
                당신의 소중한 마니또를<br />확인해보세요!
              </p>
              
              <div 
                onClick={() => setIsRevealed(true)}
                className={`
                  w-full max-w-sm p-8 rounded-2xl cursor-pointer transition-all duration-500
                  ${isRevealed 
                    ? 'bg-gradient-to-br from-rose-500 to-red-400 shadow-lg shadow-rose-200'
                    : 'bg-gradient-to-br from-gray-100 to-gray-50 hover:shadow-md hover:scale-105'
                  }
                `}
              >
                <div className="relative h-24 flex items-center justify-center">
                  <div 
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-500
                      ${isRevealed ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                    `}
                  >
                    <p className="text-gray-500 text-lg font-medium">여기를 클릭하여 확인하세요</p>
                  </div>
                  
                  <p 
                    className={`absolute inset-0 flex items-center justify-center text-2xl font-bold transition-all duration-500
                      ${isRevealed ? 'opacity-100 scale-100 text-white' : 'opacity-0 scale-95'}
                    `}
                  >
                    {manitoName}
                  </p>
                </div>
              </div>
            </>
          )}

          {type === 'reveal' && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-4">
                    <div className="w-full h-full mx-auto rotate-180 opacity-30 blur-lg filter bg-gradient-to-r from-rose-400 to-red-300" />
                  </div>
                  <span className="relative text-6xl animate-bounce inline-block"></span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                축하합니다!
              </h3>
              <p className="text-lg text-gray-600">
                이제 모든 마니또가 공개됩니다
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}