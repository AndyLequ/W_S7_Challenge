import React, { useEffect, useState } from 'react'
import * as yup from 'yup'

// 👇 Validation errors using Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L',
}

// 👇 Create your validation schema.
const validationSchema = yup.object({
  fullName: yup.string()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .trim(),
  size: yup.string()
    .oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),
})

const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  const initialFormData = {
    fullName: '',
    size: '',
    toppings: [],
  }

  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [formIsValid, setFormIsValid] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState(null) // Track success or failure
  const [submittedData, setSubmittedData] = useState(null) // Store submitted data
  const [toppingsError, setToppingsError] = useState(false)

  useEffect(() => {
    const validateForm = async () => {
      try {
        await validationSchema.validate(formData, { abortEarly: false })
        setFormIsValid(true)
        setErrors({})
      } catch (validationErrors) {
        setFormIsValid(false)
        const formErrors = {}
        validationErrors.inner.forEach((error) => {
          formErrors[error.path] = error.message
        })
        setErrors(formErrors)
      }

      if (formData.toppings.length === 0) {
        setToppingsError(true)
      } else {
        setToppingsError(false)
      }
    }
    validateForm()
  }, [formData])

  const handleChange = (evt) => {
    setFormData({
      ...formData,
      [evt.target.name]: evt.target.value,
    })
  }

  const handleToppingChange = (evt) => {
    const { checked, name } = evt.target
    setFormData((prevData) => {
      if (checked) {
        return {
          ...prevData,
          toppings: [...prevData.toppings, name],
        }
      } else {
        return {
          ...prevData,
          toppings: prevData.toppings.filter((topping) => topping !== name),
        }
      }
    })
  }

  const handleSubmit = (evt) => {
    evt.preventDefault()

    if (formIsValid) {
      setSubmissionStatus('success') // Set success status
      setSubmittedData(formData) // Store the submitted form data

      // Reset the form after submission
      setFormData(initialFormData) // Reset form fields to initial state
      setFormIsValid(false) // Disable form until it is valid again
      setErrors({}) // Clear any existing errors
    } else {
      setSubmissionStatus('error') // Set failure status
    }
  }

  const getSuccessMessage = () => {
    if (!submittedData) return null

    const { fullName, size, toppings } = submittedData
    const sizeText = size === 'S' ? 'small' : size === 'M' ? 'medium' : 'large'

    if (toppings.length === 0) {
      return `Thank you for your order, ${fullName}! Your ${sizeText} pizza with no toppings is on the way.`
    } else if (toppings.length === 1) {
      return `Thank you for your order, ${fullName}! Your ${sizeText} pizza with 1 topping is on the way.`
    } else {
      return `Thank you for your order, ${fullName}! Your ${sizeText} pizza with ${toppings.length} toppings is on the way.`
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Your Pizza</h2>
      {/* Conditionally show success or failure message */}
      {submissionStatus === 'success' && (
        <div className='success'>{getSuccessMessage()}</div>
      )}
      {submissionStatus === 'error' && (
        <div className='failure'>Something went wrong, please try again!</div>
      )}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input onChange={handleChange} value={formData.fullName} placeholder="Type full name" id="fullName" type="text" name='fullName' />
        </div>
        {errors.fullName && <div className='error'>{errors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" onChange={handleChange} name='size' value={formData.size}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {errors.size && <div className='error'>{errors.size}</div>}
      </div>

      <div className="input-group">
        {toppings.map((topping) => (
          <label key={topping.topping_id}>
            <input
              name={topping.text}
              type="checkbox"
              onChange={handleToppingChange}
              checked={formData.toppings.includes(topping.text)}
            />
            {topping.text}<br />
          </label>
        ))}
      </div>
      {toppingsError && <div className='error'>Please select at least one topping.</div>}

      <input disabled={!formIsValid} type="submit" value="Submit Order" />
    </form>
  )
}
