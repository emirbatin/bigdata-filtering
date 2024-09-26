const ProgressBar = ({ progress }) => (
    <div className="relative pt-1">
      <div className="overflow-hidden h-2 text-xs flex rounded bg-orange-200">
        <div
          style={{ width: `${progress}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
        ></div>
      </div>
      <div className="text-center text-sm text-gray-600 mt-2">
        {Math.round(progress)}% tamamlandı
      </div>
    </div>
  );
  
  export default ProgressBar;
  