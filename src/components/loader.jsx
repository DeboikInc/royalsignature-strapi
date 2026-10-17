const Logo = '/icons/favicon-310x310.png'

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="relative loader-container">
        <img
          src={Logo}
          alt="Logo"
          width={100}
          height={100}
          className="logo"
        />
        {/* Uncomment if you want a rotating spinner around the logo */}
        {/* <div className="absolute inset-0 border-2 border-t-light -m-8 border-transparent rounded-full animate-spin"></div> */}
        <div className="loader-mask text-center">Loading...</div>
      </div>
    </div>
  )
}