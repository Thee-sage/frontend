const ZixosLogo = ({ className = "" }) => (
  <span className={`inline-flex items-center ${className}`} style={{ transform: 'translateY(2px)' }}>
    <svg 
      width="16" 
      height="21" 
      viewBox="0 0 19 25" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 0 2px rgba(255, 250, 0, 0.5))',
        marginLeft: '2px'
      }}
    >
      <path 
        d="M3.88 21.36C3.38667 21.36 2.94667 21.2267 2.56 20.96C2.17333 20.68 1.86667 20.3333 1.64 19.92C1.42667 19.5067 1.32 19.1 1.32 18.7C1.32 18.4067 1.48 18.02 1.8 17.54C2.12 17.0467 2.55333 16.4933 3.1 15.88C3.64667 15.2533 4.26 14.5933 4.94 13.9C5.63333 13.2067 6.35333 12.5133 7.1 11.82C7.82 11.1267 8.54 10.4667 9.26 9.84C9.98 9.2 10.6467 8.61333 11.26 8.08C11.8867 7.54667 12.42 7.09333 12.86 6.72C12.0867 6.85333 11.32 7.00667 10.56 7.18C9.8 7.35333 9.09333 7.52 8.44 7.68C7.78667 7.82667 7.22667 7.95333 6.76 8.06C6.29333 8.15333 5.96667 8.2 5.78 8.2C5.52667 8.2 5.32 8.12667 5.16 7.98C5 7.83333 4.92 7.65333 4.92 7.44C4.92 7.29333 5.08667 7.14 5.42 6.98C5.75333 6.80667 6.19333 6.64 6.74 6.48C7.28667 6.30667 7.88667 6.14667 8.54 6C9.19333 5.84 9.84 5.7 10.48 5.58C11.1333 5.46 11.7267 5.36667 12.26 5.3C12.8067 5.23333 13.2333 5.2 13.54 5.2C13.9267 5.2 14.2667 5.34667 14.56 5.64C14.8533 5.92 15 6.24 15 6.6C15 6.68 14.8067 6.92 14.42 7.32C14.0333 7.70667 13.5133 8.20667 12.86 8.82C12.22 9.42 11.5067 10.0933 10.72 10.84C9.93333 11.5867 9.13333 12.3533 8.32 13.14C7.61333 13.82 6.92 14.4933 6.24 15.16C5.57333 15.8133 4.97333 16.42 4.44 16.98C3.90667 17.5267 3.48 18.0067 3.16 18.42C2.85333 18.82 2.7 19.1133 2.7 19.3C2.7 19.42 2.74667 19.5133 2.84 19.58C2.94667 19.6333 3.07333 19.66 3.22 19.66C3.43333 19.66 3.78667 19.6267 4.28 19.56C4.78667 19.48 5.37333 19.3867 6.04 19.28C6.70667 19.16 7.4 19.04 8.12 18.92C8.84 18.8 9.52 18.6867 10.16 18.58C10.8133 18.46 11.3667 18.3667 11.82 18.3C12.2733 18.22 12.5667 18.18 12.7 18.18C13.2067 18.18 13.46 18.3733 13.46 18.76C13.46 18.9867 13.2867 19.2067 12.94 19.42C12.5933 19.6333 12.1267 19.84 11.54 20.04C10.9667 20.2267 10.3267 20.4 9.62 20.56C8.92667 20.72 8.22 20.86 7.5 20.98C6.78 21.1 6.1 21.1933 5.46 21.26C4.83333 21.3267 4.30667 21.36 3.88 21.36Z" 
        fill="#FFFA00"
      />
      <line 
        x1="8.5" 
        y1="4" 
        x2="8.5" 
        y2="25" 
        stroke="#1EBA2B" 
        strokeWidth="1.5"
      />
    </svg>
  </span>
);

export default ZixosLogo;