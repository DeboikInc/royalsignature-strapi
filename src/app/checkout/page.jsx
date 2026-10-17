// app/checkout/page.js
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { RiPencilLine, RiArrowRightLine, RiBankCardLine, RiShieldCheckLine, RiFlutterFill } from 'react-icons/ri'
import { createBooking, fetchRateById, fetchAccommodationTypeById, fetchBooking, payWithPaystack, payWithFlutterwave } from '@/app/api'
import Loader from '@/components/loader'
import AdditionalServices from '@/components/AdditionalServices'
import { useToast } from '@/context/toastContext'

export default function CheckOut() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState();
  const [activeStep, setActiveStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bookingIntent, setBookingIntent] = useState(null);
  const [authoritativeTotal, setAuthoritativeTotal] = useState(null);

  const [servicesData, setServicesData] = useState({
    selectedServiceIds: [],
    selectedServices: [],
    total: 0
  })

  const { addToast } = useToast();

  // Get booking parameters from URL
  const rateId = searchParams.get('rate_id')
  const checkIn = searchParams.get('check_in')
  const checkOut = searchParams.get('check_out')
  const adults = searchParams.get('adults')
  const children = searchParams.get('children')
  const apartmentId = searchParams.get('apartment_id')
  const accommodationId = searchParams.get('accommodation_id')

  const [formData, setFormData] = useState({
    customer: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      country: '',
      state: '',
      city: '',
      zip: '',
      address: ''
    },
    check_in_date: checkIn, // Should come from booking context
    check_out_date: checkOut, // Should come from booking context
    reserved_accommodations: [{
      accommodation: Number(accommodationId), // Should come from booking context
      adults: Number(adults),
      children: Number(children),
      guest_name: '',
      services: [{
        id: servicesData.selectedServiceIds[0],
        adults: Number(adults),
        quantity: 1
      }]
    }],
    coupon_code: '',
    note: '',
    guest_consent: false,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        // Fetch property details
        const [rateDetails, accommodationDetails] = await Promise.all([
          fetchRateById(rateId),
          fetchAccommodationTypeById(apartmentId),
        ])

        // Calculate number of nights
        const checkInDate = new Date(checkIn)
        const checkOutDate = new Date(checkOut)
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

        // Calculate total price
        const basePrice = rateDetails.season_prices?.[0]?.base_price || 0
        const serviceFee = servicesData.total

        setBookingData({
          property: {
            ...rateDetails,
            ...accommodationDetails
          },
          dates: {
            checkIn,
            checkOut,
            nights
          },
          guests: {
            adults,
            children
          },
          pricing: {
            basePrice,
            serviceFee,
            total: basePrice * nights + serviceFee
          }
        })

      } catch (error) {
        addToast(`Error loading booking data, pls try again`, 'error')
      } finally {
        setLoading(false)
      }
    }

    if (rateId && apartmentId) loadBookingData()

  }, [rateId, checkIn, checkOut, adults, children, router, servicesData])

  useEffect(() => {
    const previousBooking = async () => {
      const bookingId = localStorage.getItem("bookingId");
      if (bookingId) {
        const initialBooking = await fetchBooking(bookingId)

        if (initialBooking?.status === "pending-payment") {
          setActiveStep(2)
          setBookingIntent(initialBooking)
          setAuthoritativeTotal(Number(initialBooking.total_price))
          setBookingData((current) => current ? {
            ...current,
            pricing: { ...current.pricing, total: Number(initialBooking.total_price), currency: initialBooking.currency || 'NGN' },
          } : current)
        }
      }
    }
    previousBooking()
  }, []);

  const handleServiceSelection = (data) => {
    setServicesData(data)
    // Update form data with selected services
    setFormData(prev => ({
      ...prev,
      reserved_accommodations: [{
        ...prev.reserved_accommodations[0],
        services: data.selectedServiceIds
      }]
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('customer.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const booking = await createBooking({
        ...formData,
        status: 'pending-payment' // Initial status
      })

      if (booking.status === "pending-payment") {
        setBookingIntent(booking);
        setAuthoritativeTotal(Number(booking.total_price))
        setBookingData((current) => current ? {
          ...current,
          pricing: { ...current.pricing, total: Number(booking.total_price), currency: booking.currency || 'NGN' },
        } : current)
        setActiveStep(2)
      }
      addToast(booking.message, 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to process booking. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Handle payment based on selected method
      if (paymentMethod === 'flutter_wave') {
        // Redirect to flutterwave
        const data = await payWithFlutterwave({ bookingIntent, ...bookingData })

        if (data?.link) {
          location.href = data.link;
        } else {
          addToast('Could not start Flutterwave', 'error')
        }

      } else if (paymentMethod === 'paystack') {
        // Process Paystack payment
        const data = await payWithPaystack({ bookingIntent, ...bookingData })
        if (data?.authorization_url) {
          location.href = data.authorization_url;
        } else {
          addToast('Could not start Paystack', 'error')
        }
      }
    } catch (err) {
      addToast('Failed to process payment. Please try again', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!rateId || !apartmentId || !checkIn || !checkOut) {
    return (
      <main className="page-content">
        <div className="status-panel">
          <h1>Choose a room before checkout</h1>
          <p>Check availability first so your stay dates and room can be confirmed.</p>
          <Link href="/booking" className="text-link">Choose dates and rooms</Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (<Loader />)
  }

  if (!bookingData) {
    return (
      <main className="page-content">
        <div className="status-panel">
          <h1>Booking Not Found</h1>
          <p>We couldn't retrieve your booking details.</p>
          <Link href="/booking" className="text-link">Check availability</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-24">
      {/* Progress Steps */}

      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between max-w-3xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`checkout-step flex flex-col items-center border-b-2 ${activeStep >= step ? 'border-accent' : 'border-gray-200'} pb-2 w-1/3`}
              >
                <div className={`step-number w-8 h-8 flex items-center justify-center ${activeStep >= step ? 'bg-accent text-white' : 'bg-gray-200'} rounded-full mb-2 font-medium`}>
                  {step}
                </div>
                <span className={`text-sm ${activeStep >= step ? 'font-medium' : 'text-gray-500'}`}>
                  {step === 1 ? 'Your Details' : step === 2 ? 'Payment' : 'Confirmation'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-light">
        <div className="flex flex-col lg:flex-row gap-8 container mx-auto px-4 py-16 max-w-7xl">

          {/* Left Column - Booking Form */}
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold mb-6">Complete Your Booking</h2>

            {activeStep === 1 && (
              <form onSubmit={handleBooking}>
                {/* Step 1: Guest Information */}
                <>
                  {/* Property Summary */}
                  <div className="bg-white rounded-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="w-full sm:w-1/3">
                        <img
                          src={bookingData?.property.images[0]?.src}
                          alt={bookingData?.property.title}
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                      <div className="w-full sm:w-2/3">
                        <h3 className="text-xl font-bold mb-2">{bookingData?.property.title}</h3>
                        <p className="text-gray-600 mb-4">{bookingData?.property.view || 'Location not specified'}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Check-in</p>
                            <p className="font-medium">
                              {new Date(bookingData.dates.checkIn).toLocaleDateString('en-NG', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Check-out</p>
                            <p className="font-medium">
                              {new Date(bookingData.dates.checkOut).toLocaleDateString('en-NG', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Guests</p>
                            <p className="font-medium">
                              {bookingData.guests.adults} {bookingData.guests.adults === '1' ? 'adult' : 'adults'}
                              {bookingData.guests.children !== '0' && `, ${bookingData.guests.children} ${bookingData.guests.children === '1' ? 'child' : 'children'}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Nights</p>
                            <p className="font-medium">{bookingData.dates.nights}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => router.push(`/apartments/details?id=${rateId}`)}
                          className="text-accent font-medium text-sm flex items-center"
                        >
                          <RiPencilLine className="mr-1" /> Edit booking details
                        </button>
                      </div>
                    </div>
                  </div>

                  <AdditionalServices
                    accommodationTypeId={apartmentId}
                    onSelectionChange={handleServiceSelection}
                  />

                  <div className="bg-white rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-bold mb-6">Guest Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                        <input
                          type="text"
                          name="customer.first_name"
                          value={formData.customer.first_name}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                        <input
                          type="text"
                          name="customer.last_name"
                          value={formData.customer.last_name}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                        <input
                          type="email"
                          name="customer.email"
                          value={formData.customer.email}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                        <input
                          type="tel"
                          name="customer.phone"
                          value={formData.customer.phone}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <select
                          required
                          name="customer.country"
                          value={formData.customer.country}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                        >
                          <option value="">Select a country</option>
                          <option value="AX">Åland Islands</option>
                          <option value="AF">Afghanistan</option>
                          <option value="AL">Albania</option>
                          <option value="DZ">Algeria</option>
                          <option value="AS">American Samoa</option>
                          <option value="AD">Andorra</option>
                          <option value="AO">Angola</option>
                          <option value="AI">Anguilla</option>
                          <option value="AQ">Antarctica</option>
                          <option value="AG">Antigua and Barbuda</option>
                          <option value="AR">Argentina</option>
                          <option value="AM">Armenia</option>
                          <option value="AW">Aruba</option>
                          <option value="AU">Australia</option>
                          <option value="AT">Austria</option>
                          <option value="AZ">Azerbaijan</option>
                          <option value="BS">Bahamas</option>
                          <option value="BH">Bahrain</option>
                          <option value="BD">Bangladesh</option>
                          <option value="BB">Barbados</option>
                          <option value="BY">Belarus</option>
                          <option value="PW">Belau</option>
                          <option value="BE">Belgium</option>
                          <option value="BZ">Belize</option>
                          <option value="BJ">Benin</option>
                          <option value="BM">Bermuda</option>
                          <option value="BT">Bhutan</option>
                          <option value="BO">Bolivia</option>
                          <option value="BQ">Bonaire, Saint Eustatius and Saba</option>
                          <option value="BA">Bosnia and Herzegovina</option>
                          <option value="BW">Botswana</option>
                          <option value="BV">Bouvet Island</option>
                          <option value="BR">Brazil</option>
                          <option value="IO">British Indian Ocean Territory</option>
                          <option value="VG">British Virgin Islands</option>
                          <option value="BN">Brunei</option>
                          <option value="BG">Bulgaria</option>
                          <option value="BF">Burkina Faso</option>
                          <option value="BI">Burundi</option>
                          <option value="KH">Cambodia</option>
                          <option value="CM">Cameroon</option>
                          <option value="CA">Canada</option>
                          <option value="CV">Cape Verde</option>
                          <option value="KY">Cayman Islands</option>
                          <option value="CF">Central African Republic</option>
                          <option value="TD">Chad</option>
                          <option value="CL">Chile</option>
                          <option value="CN">China</option>
                          <option value="CX">Christmas Island</option>
                          <option value="CC">Cocos (Keeling) Islands</option>
                          <option value="CO">Colombia</option>
                          <option value="KM">Comoros</option>
                          <option value="CG">Congo (Brazzaville)</option>
                          <option value="CD">Congo (Kinshasa)</option>
                          <option value="CK">Cook Islands</option>
                          <option value="CR">Costa Rica</option>
                          <option value="HR">Croatia</option>
                          <option value="CU">Cuba</option>
                          <option value="CW">Curaçao</option>
                          <option value="CY">Cyprus</option>
                          <option value="CZ">Czech Republic</option>
                          <option value="DK">Denmark</option>
                          <option value="DJ">Djibouti</option>
                          <option value="DM">Dominica</option>
                          <option value="DO">Dominican Republic</option>
                          <option value="EC">Ecuador</option>
                          <option value="EG">Egypt</option>
                          <option value="SV">El Salvador</option>
                          <option value="GQ">Equatorial Guinea</option>
                          <option value="ER">Eritrea</option>
                          <option value="EE">Estonia</option>
                          <option value="ET">Ethiopia</option>
                          <option value="FK">Falkland Islands</option>
                          <option value="FO">Faroe Islands</option>
                          <option value="FJ">Fiji</option>
                          <option value="FI">Finland</option>
                          <option value="FR">France</option>
                          <option value="GF">French Guiana</option>
                          <option value="PF">French Polynesia</option>
                          <option value="TF">French Southern Territories</option>
                          <option value="GA">Gabon</option>
                          <option value="GM">Gambia</option>
                          <option value="GE">Georgia</option>
                          <option value="DE">Germany</option>
                          <option value="GH">Ghana</option>
                          <option value="GI">Gibraltar</option>
                          <option value="GR">Greece</option>
                          <option value="GL">Greenland</option>
                          <option value="GD">Grenada</option>
                          <option value="GP">Guadeloupe</option>
                          <option value="GU">Guam</option>
                          <option value="GT">Guatemala</option>
                          <option value="GG">Guernsey</option>
                          <option value="GN">Guinea</option>
                          <option value="GW">Guinea-Bissau</option>
                          <option value="GY">Guyana</option>
                          <option value="HT">Haiti</option>
                          <option value="HM">Heard Island and McDonald Islands</option>
                          <option value="HN">Honduras</option>
                          <option value="HK">Hong Kong</option>
                          <option value="HU">Hungary</option>
                          <option value="IS">Iceland</option>
                          <option value="IN">India</option>
                          <option value="ID">Indonesia</option>
                          <option value="IR">Iran</option>
                          <option value="IQ">Iraq</option>
                          <option value="IE">Ireland</option>
                          <option value="IM">Isle of Man</option>
                          <option value="IL">Israel</option>
                          <option value="IT">Italy</option>
                          <option value="CI">Ivory Coast</option>
                          <option value="JM">Jamaica</option>
                          <option value="JP">Japan</option>
                          <option value="JE">Jersey</option>
                          <option value="JO">Jordan</option>
                          <option value="KZ">Kazakhstan</option>
                          <option value="KE">Kenya</option>
                          <option value="KI">Kiribati</option>
                          <option value="KW">Kuwait</option>
                          <option value="KG">Kyrgyzstan</option>
                          <option value="LA">Laos</option>
                          <option value="LV">Latvia</option>
                          <option value="LB">Lebanon</option>
                          <option value="LS">Lesotho</option>
                          <option value="LR">Liberia</option>
                          <option value="LY">Libya</option>
                          <option value="LI">Liechtenstein</option>
                          <option value="LT">Lithuania</option>
                          <option value="LU">Luxembourg</option>
                          <option value="MO">Macao</option>
                          <option value="MK">Macedonia</option>
                          <option value="MG">Madagascar</option>
                          <option value="MW">Malawi</option>
                          <option value="MY">Malaysia</option>
                          <option value="MV">Maldives</option>
                          <option value="ML">Mali</option>
                          <option value="MT">Malta</option>
                          <option value="MH">Marshall Islands</option>
                          <option value="MQ">Martinique</option>
                          <option value="MR">Mauritania</option>
                          <option value="MU">Mauritius</option>
                          <option value="YT">Mayotte</option>
                          <option value="MX">Mexico</option>
                          <option value="FM">Micronesia</option>
                          <option value="MD">Moldova</option>
                          <option value="MC">Monaco</option>
                          <option value="MN">Mongolia</option>
                          <option value="ME">Montenegro</option>
                          <option value="MS">Montserrat</option>
                          <option value="MA">Morocco</option>
                          <option value="MZ">Mozambique</option>
                          <option value="MM">Myanmar</option>
                          <option value="NA">Namibia</option>
                          <option value="NR">Nauru</option>
                          <option value="NP">Nepal</option>
                          <option value="NL">Netherlands</option>
                          <option value="NC">New Caledonia</option>
                          <option value="NZ">New Zealand</option>
                          <option value="NI">Nicaragua</option>
                          <option value="NE">Niger</option>
                          <option value="NG">Nigeria</option>
                          <option value="NU">Niue</option>
                          <option value="NF">Norfolk Island</option>
                          <option value="KP">North Korea</option>
                          <option value="MP">Northern Mariana Islands</option>
                          <option value="NO">Norway</option>
                          <option value="OM">Oman</option>
                          <option value="PK">Pakistan</option>
                          <option value="PS">Palestinian Territory</option>
                          <option value="PA">Panama</option>
                          <option value="PG">Papua New Guinea</option>
                          <option value="PY">Paraguay</option>
                          <option value="PE">Peru</option>
                          <option value="PH">Philippines</option>
                          <option value="PN">Pitcairn</option>
                          <option value="PL">Poland</option>
                          <option value="PT">Portugal</option>
                          <option value="PR">Puerto Rico</option>
                          <option value="QA">Qatar</option>
                          <option value="RE">Réunion</option>
                          <option value="RO">Romania</option>
                          <option value="RU">Russia</option>
                          <option value="RW">Rwanda</option>
                          <option value="ST">São Tomé and Príncipe</option>
                          <option value="BL">Saint Barthélemy</option>
                          <option value="SH">Saint Helena</option>
                          <option value="KN">Saint Kitts and Nevis</option>
                          <option value="LC">Saint Lucia</option>
                          <option value="SX">Saint Martin (Dutch part)</option>
                          <option value="MF">Saint Martin (French part)</option>
                          <option value="PM">Saint Pierre and Miquelon</option>
                          <option value="VC">Saint Vincent and the Grenadines</option>
                          <option value="WS">Samoa</option>
                          <option value="SM">San Marino</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="SN">Senegal</option>
                          <option value="RS">Serbia</option>
                          <option value="SC">Seychelles</option>
                          <option value="SL">Sierra Leone</option>
                          <option value="SG">Singapore</option>
                          <option value="SK">Slovakia</option>
                          <option value="SI">Slovenia</option>
                          <option value="SB">Solomon Islands</option>
                          <option value="SO">Somalia</option>
                          <option value="ZA">South Africa</option>
                          <option value="GS">South Georgia/Sandwich Islands</option>
                          <option value="KR">South Korea</option>
                          <option value="SS">South Sudan</option>
                          <option value="ES">Spain</option>
                          <option value="LK">Sri Lanka</option>
                          <option value="SD">Sudan</option>
                          <option value="SR">Suriname</option>
                          <option value="SJ">Svalbard and Jan Mayen</option>
                          <option value="SZ">Swaziland</option>
                          <option value="SE">Sweden</option>
                          <option value="CH">Switzerland</option>
                          <option value="SY">Syria</option>
                          <option value="TW">Taiwan</option>
                          <option value="TJ">Tajikistan</option>
                          <option value="TZ">Tanzania</option>
                          <option value="TH">Thailand</option>
                          <option value="TL">Timor-Leste</option>
                          <option value="TG">Togo</option>
                          <option value="TK">Tokelau</option>
                          <option value="TO">Tonga</option>
                          <option value="TT">Trinidad and Tobago</option>
                          <option value="TN">Tunisia</option>
                          <option value="TR">Turkey</option>
                          <option value="TM">Turkmenistan</option>
                          <option value="TC">Turks and Caicos Islands</option>
                          <option value="TV">Tuvalu</option>
                          <option value="UG">Uganda</option>
                          <option value="UA">Ukraine</option>
                          <option value="AE">United Arab Emirates</option>
                          <option value="GB">United Kingdom (UK)</option>
                          <option value="US">United States (US)</option>
                          <option value="UM">United States (US) Minor Outlying Islands</option>
                          <option value="VI">United States (US) Virgin Islands</option>
                          <option value="UY">Uruguay</option>
                          <option value="UZ">Uzbekistan</option>
                          <option value="VU">Vanuatu</option>
                          <option value="VA">Vatican</option>
                          <option value="VE">Venezuela</option>
                          <option value="VN">Vietnam</option>
                          <option value="WF">Wallis and Futuna</option>
                          <option value="EH">Western Sahara</option>
                          <option value="YE">Yemen</option>
                          <option value="ZM">Zambia</option>
                          <option value="ZW">Zimbabwe</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          name="customer.state"
                          value={formData.customer.state}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="customer.city"
                          value={formData.customer.city}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                        <input
                          type="text"
                          name="coupon_code"
                          value={formData.coupon_code}
                          onChange={handleInputChange}
                          className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests (Optional)</label>
                      <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        className="w-full py-2 px-3 border border-gray-200 rounded text-sm focus:outline-none focus:border-accent h-24"
                        placeholder="Early check-in, late check-out, etc."
                      ></textarea>
                    </div>
                    <label className="mb-6 flex items-start gap-3 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        name="guest_consent"
                        checked={formData.guest_consent}
                        onChange={(event) => setFormData((current) => ({ ...current, guest_consent: event.target.checked }))}
                        required
                      />
                      <span>I agree to the <a href="/privacy-policy" className="text-accent underline">Privacy Policy</a> and <a href="/terms" className="text-accent underline">Terms &amp; Conditions</a>.</span>
                    </label>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`bg-accent w-full block justify-end hover:bg-accent/90 text-white px-8 py-3 font-medium rounded-lg ${loading ? 'opacity-70' : ''}`}
                    >
                      {loading ? 'Creating booking…' : 'Create Booking'}
                    </button>
                  </div>
                </>
              </form>
            )}

            {/* Step 2: Payment Method */}
            {activeStep === 2 && (
              <form className="bg-white rounded-lg p-6 mb-8" onSubmit={handlePayment}>
                <h3 className="text-xl font-bold mb-6">Payment Method</h3>

                <div className="space-y-4 mb-6">
                  {[
                    // { id: 'flutter_wave', label: 'Flutter Wave', icon: <RiFlutterFill className="text-green-500" /> },
                    { id: 'paystack', label: 'Paystack', icon: <RiBankCardLine className="text-purple-500" /> }
                  ].map((method) => (
                    <div
                      key={method.id}
                      className={`payment-method p-4 border-2 rounded-lg cursor-pointer ${paymentMethod === method.id ? 'border-accent bg-pale' : 'border-gray-200 hover:border-accent'}`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full mr-4">
                          {method.icon}
                        </div>
                        <span className="font-medium">{method.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="bg-accent hover:bg-accent/90 text-white px-8 py-3 font-medium rounded-lg"
                >
                  {loading ? 'Processing...' : `Continue to Payment`} <RiArrowRightLine className="ml-2 inline" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl sticky top-6 p-6">
              <h3 className="text-xl font-bold mb-6">Booking Summary</h3>
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h4 className="font-bold mb-2">{bookingData.property.title}</h4>
                <p className="text-gray-600 text-sm mb-2">{bookingData.property.view || 'Location not specified'}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(formData.check_in_date).toLocaleDateString()} - {new Date(formData.check_out_date).toLocaleDateString()}
                </p>
                {bookingIntent?.status === "pending-payment" &&
                  <small className='text-yellow-400'>your {bookingIntent?.status}, will expire in an hour</small>
                }
              </div>


              <div className="flex justify-between font-bold text-lg border-b border-gray-200 pb-4 mb-4">
                <span>Total</span>
                <span>{new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN'
                }).format(authoritativeTotal ?? bookingData?.pricing?.total)}</span>
              </div>

              <div className="bg-pale rounded-lg p-4 mb-6">
                <h4 className="font-bold mb-2 flex items-center">
                  <RiShieldCheckLine className="text-accent mr-2" />
                  Booking Protection
                </h4>
                <p className="text-gray-600 text-sm">Your booking is protected by our comprehensive guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </main>
  )
}
