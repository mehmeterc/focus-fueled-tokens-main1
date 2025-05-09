
interface CoinProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Coin = ({ size = 'md', className = '' }: CoinProps) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`${sizes[size]} ${className} relative animate-coin-spin`}>
      <div className="absolute inset-0 rounded-full bg-antiapp-teal flex items-center justify-center text-white font-bold">
        <span className={size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-3xl'}>Anti</span>
      </div>
    </div>
  );
};

export default Coin;
