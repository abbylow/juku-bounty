export type IconProps = React.HTMLAttributes<SVGElement>

export const Icons = {
  logo: (props: IconProps) => (
    <svg width="188" height="80" viewBox="0 0 188 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M138.706 72.3089L125.975 55.2992H123.88V72.3089H113.798V20.256H123.88V48.7237H126.015L138.271 33.6827H149.973L135.046 51.7243L150.566 72.3089H138.706Z" fill="#292828" />
      <path d="M161.855 33.6826V56.9135C161.855 58.5147 162.066 59.9191 162.488 61.1265C162.936 62.3078 163.661 63.2265 164.662 63.8827C165.69 64.5127 167.061 64.8277 168.774 64.8277C170.329 64.8277 171.673 64.5521 172.807 64.0009C173.94 63.4496 174.876 62.7146 175.614 61.7959C176.199 61.0458 176.661 60.2296 176.997 59.3471V33.6826H187.119V72.3088H177.037L177.348 64.119H176.918C176.497 65.7989 175.785 67.3345 174.783 68.7258C173.808 70.0908 172.464 71.1801 170.751 71.9938C169.064 72.8076 166.942 73.2144 164.385 73.2144C161.433 73.2144 159.022 72.6501 157.15 71.5214C155.305 70.3926 153.935 68.7258 153.039 66.5208C152.169 64.3158 151.734 61.599 151.734 58.3703V33.6826H161.855Z" fill="#292828" />
      <path d="M81.6404 56.9135V33.6826H71.5192V58.3703C71.5192 61.599 71.9541 64.3158 72.8239 66.5208C73.72 68.7258 75.0906 70.3926 76.9356 71.5214C78.807 72.6501 81.2187 73.2144 84.1707 73.2144C86.7273 73.2144 88.8491 72.8076 90.536 71.9938C92.2492 71.1801 93.5934 70.0908 94.5686 68.7258C95.5702 67.3345 96.2819 65.7989 96.7036 64.119H97.1332L96.8222 72.3088H106.904V33.6826H96.7827V59.3471C96.446 60.2295 95.9847 61.0458 95.3989 61.7959C94.6609 62.7146 93.7252 63.4496 92.5919 64.0009C91.4585 64.5521 90.1143 64.8277 88.5592 64.8277C86.846 64.8277 85.4754 64.5127 84.4474 63.8827C83.4459 63.2265 82.721 62.3078 82.273 61.1265C81.8512 59.9191 81.6404 58.5147 81.6404 56.9135Z" fill="#292828" />
      <path d="M55.0522 65.1059C56.4146 67.2534 57.95 70.2568 59.0718 72.4758H69.5472C67.1494 66.8273 63.627 60.5906 60.248 55.8066C59.0272 59.2719 57.2401 62.3849 55.0522 65.1059Z" fill="#292828" />
      <path d="M30.4883 76.4946C40.8751 73.4433 50.5412 65.3179 55.2184 53.6714C56.3051 50.9656 58.2319 46.0954 57.5276 39.2127C57.1776 35.7923 55.2184 30.1318 52.8399 24.5762L44.3512 28.2378C45.1663 30.1318 46.3888 33.6492 47.068 35.6785C47.4755 36.896 47.9222 38.1136 48.1547 40.0076C49.3542 49.7751 43.0414 62.9681 28.3268 67.2908C18.546 70.1641 13.2567 66.2831 11.3673 59.9042C9.12048 52.3184 11.5957 46.0628 21.4631 43.164C28.9935 40.9519 34.9696 43.9751 40.2347 49.3624L43.4253 39.8044C36.3812 32.2224 26.3014 30.5921 17.992 33.0331C2.23878 37.6609 -2.4974 50.5777 1.1792 62.9908C4.57494 74.4557 15.6872 80.8427 30.4883 76.4946Z" fill="#292828" />
      <path fillRule="evenodd" clipRule="evenodd" d="M66.0933 9.45591C52.318 20.7062 42.3877 23.7233 32.1355 24.8759C25.5519 25.6161 12.9035 25.8315 6.60018 25.2955L6.60019 15.8599C12.2404 16.3396 25.0684 16.1404 31.0689 15.4658C39.3757 14.5319 47.6067 12.3069 60.0638 2.1333L66.0933 9.45591Z" fill="#292828" />
    </svg>
  ),
  logoShort: (props: IconProps) => (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60.2527 65.1059C61.6118 67.2534 63.1435 70.2568 64.2626 72.4758H74.7127C72.3207 66.8273 68.8068 60.5906 65.436 55.8066C64.2181 59.2719 62.4354 62.3849 60.2527 65.1059Z" fill="#292828" />
      <path d="M35.7482 76.4946C46.1098 73.4433 55.7526 65.3179 60.4186 53.6714C61.5026 50.9656 63.4248 46.0954 62.7222 39.2127C62.373 35.7923 60.4185 30.1318 58.0457 24.5762L49.5776 28.2378C50.3907 30.1318 51.6103 33.6492 52.2878 35.6785C52.6944 36.896 53.1399 38.1136 53.3719 40.0076C54.5685 49.7751 48.2709 62.9681 33.5919 67.2908C23.8347 70.1641 18.5581 66.2831 16.6733 59.9042C14.4319 52.3184 16.9012 46.0628 26.7447 43.164C34.2569 40.9519 40.2186 43.9751 45.471 49.3624L48.6539 39.8044C41.6268 32.2224 31.5713 30.5921 23.282 33.0331C7.56687 37.6609 2.84213 50.5777 6.50984 62.9908C9.89739 74.4557 20.9828 80.8427 35.7482 76.4946Z" fill="#292828" />
      <path fillRule="evenodd" clipRule="evenodd" d="M71.2672 9.45591C57.5251 20.7062 47.6188 23.7233 37.3914 24.8759C30.8237 25.6161 18.2058 25.8315 11.9177 25.2955L11.9177 15.8599C17.5443 16.3396 30.3413 16.1404 36.3273 15.4658C44.6141 14.5319 52.8252 12.3069 65.2522 2.1333L71.2672 9.45591Z" fill="#292828" />
    </svg>
  ),
  bellDot: (props: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19.4 14.9C20.2 16.4 21 17 21 17H3s3-2 3-9c0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.3" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <circle cx="18" cy="8" r="3" fill="coral" color="coral" />
    </svg>
  ),
  linkedIn: (props: IconProps) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="#292828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11V16" stroke="#292828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8V8.01" stroke="#292828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16V11" stroke="#292828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16V13C16 11.8954 15.1046 11 14 11C12.8954 11 12 11.8954 12 13" stroke="#292828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
