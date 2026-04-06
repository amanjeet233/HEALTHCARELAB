import React from 'react';

const AuthInput = React.forwardRef<HTMLInputElement, any>(({ label, icon, error, ...props }, ref) => (
    <div className="group space-y-2 px-1">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-gray/60 px-1">{label}</label>
        <div className="relative">
            <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors text-sm pointer-events-none ${error ? 'text-secondary/60' : 'text-muted-gray group-focus-within:text-primary-teal opacity-60'}`}>
                {icon}
            </div>
            <input
                ref={ref}
                {...props}
                className={`w-full bg-off-white border-2 ${error ? 'border-secondary/30' : 'border-primary-teal/5'} focus:border-primary-teal/20 focus:bg-white focus:ring-4 ${error ? 'focus:ring-secondary/5' : 'focus:ring-primary-teal/5'} rounded-2xl py-4 pl-14 pr-6 text-[11px] font-bold text-ever-green outline-none transition-all placeholder:text-muted-gray/30 placeholder:uppercase placeholder:font-black placeholder:tracking-[0.15em] h-14`}
            />
            {error && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(131,178,191,0.6)]" />
                </div>
            )}
        </div>
        {error && <p className="text-[9px] text-secondary font-black px-1 uppercase tracking-widest mt-1">{error.message}</p>}
    </div>
));

AuthInput.displayName = 'AuthInput';

export default AuthInput;
