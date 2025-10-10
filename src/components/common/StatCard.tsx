type StatCardProps = {
  title: string;
  value: string | number;
};

const StatCard =  (  { title, value }:StatCardProps) => (
  <div className="min-w-[220px] bg-[#E4B587]/70 rounded-[20px]  px-6 py-3 flex flex-col items-center">
    <span className="text-xs text-balck font-medium tracking-wide">{title}</span>
    <span className="text-xl font-semibold text-[#650933] mt-1">{value}</span>
  </div>
);

export default StatCard;