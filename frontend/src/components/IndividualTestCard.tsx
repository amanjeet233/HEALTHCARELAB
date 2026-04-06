import React, { useState } from 'react'
import { FaFlask, FaTag, FaCheckCircle } from 'react-icons/fa'
import { GiBlood, GiWaterDrop } from 'react-icons/gi'
import { FiInfo } from 'react-icons/fi'
import './IndividualTestCard.css'

interface IndividualTest {
  id: number
  testCode: string
  testName: string
  categoryName: string
  price: number
  originalPrice?: number
  description: string
  shortDescription?: string
  turnaroundTime: string
  fastingRequired: boolean
  fastingHours?: number
  sampleType: string
  subTests?: string[]
  tags?: string[]
  isActive?: boolean
}

interface IndividualTestCardProps {
  test: IndividualTest
  onViewDetails: (testCode: string) => void
  onAddToCart: (testId: number) => Promise<void>
  isLoading?: boolean
}

const getCategoryIcon = (category: string) => {
  const cat = category.toUpperCase()
  switch (cat) {
    case 'BLOOD':
      return <GiBlood className='category-icon blood' />
    case 'URINE':
      return <GiWaterDrop className='category-icon urine' />
    case 'IMAGING':
      return <FaFlask className='category-icon imaging' />
    case 'PATHOLOGY':
      return <FaFlask className='category-icon pathology' />
    default:
      return <FaFlask className='category-icon' />
  }
}

const getDiscountPercentage = (price: number, originalPrice?: number): number => {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export const IndividualTestCard: React.FC<IndividualTestCardProps> = ({
  test,
  onViewDetails,
  onAddToCart,
  isLoading = false
}) => {
  const [expanded, setExpanded] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)

  const hasSubTests = test.subTests && test.subTests.length > 0
  const displayedSubTests = expanded ? test.subTests : (test.subTests?.slice(0, 3) || [])
  const hiddenSubTestsCount = hasSubTests ? Math.max(0, (test.subTests?.length || 0) - 3) : 0

  const discountPercent = getDiscountPercentage(test.price, test.originalPrice)
  const displayPrice = test.price
  const originalPriceDisplay = test.originalPrice && test.originalPrice > test.price ? test.originalPrice : null

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setAddingToCart(true)
    try {
      await onAddToCart(test.id)
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart', error)
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className='individual-test-card' onClick={() => onViewDetails(test.testCode)}>
      {/* Header */}
      <div className='card-header-individual'>
        <div className='category-badge-individual'>
          {getCategoryIcon(test.categoryName)}
          <span>{test.categoryName}</span>
        </div>
        {discountPercent > 0 && (
          <div className='discount-badge'>
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Test Title */}
      <h3 className='test-title-individual'>{test.testName}</h3>

      {/* Test Code */}
      <p className='test-code'>{test.testCode}</p>

      {/* Short Description */}
      <p className='test-description'>{test.shortDescription || test.description.substring(0, 80) + '...'}</p>

      {/* Price Section */}
      <div className='price-section-individual'>
        <div className='price-display'>
          <span className='current-price'>₹{displayPrice}</span>
          {originalPriceDisplay && (
            <span className='original-price'>₹{originalPriceDisplay}</span>
          )}
        </div>
      </div>

      {/* Info Badges */}
      <div className='info-badges-individual'>
        {test.fastingRequired && (
          <div className='info-badge fasting'>
            <span className='icon'>🍽️</span>
            <span className='text'>{test.fastingHours || 8}h Fasting</span>
          </div>
        )}
        <div className='info-badge turnaround'>
          <span className='icon'>⏱️</span>
          <span className='text'>{test.turnaroundTime}</span>
        </div>
        <div className='info-badge sample'>
          <span className='icon'>💉</span>
          <span className='text'>{test.sampleType.split('/')[0]}</span>
        </div>
      </div>

      {/* Sub Tests Section */}
      {hasSubTests && (
        <div className='subtests-section'>
          <div className='subtests-header'>
            <FaCheckCircle className='subtests-icon' />
            <span className='subtests-title'>
              Includes {test.subTests?.length} tests
            </span>
          </div>
          <div className='subtests-list'>
            {displayedSubTests.map((subTest, index) => (
              <div key={index} className='subtest-item'>
                <span className='subtest-bullet'>•</span>
                <span>{subTest}</span>
              </div>
            ))}
            {hiddenSubTestsCount > 0 && !expanded && (
              <button
                className='expand-button'
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(true)
                }}
              >
                +{hiddenSubTestsCount} more
              </button>
            )}
            {expanded && hiddenSubTestsCount > 0 && (
              <button
                className='expand-button'
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(false)
                }}
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {test.tags && test.tags.length > 0 && (
        <div className='tags-section'>
          <div className='tags-list'>
            {test.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className='tag-badge'>
                <FaTag className='tag-icon' />
                {tag}
              </span>
            ))}
            {test.tags.length > 3 && (
              <span className='tag-badge more-tags'>
                +{test.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        className={`add-to-cart-button ${cartAdded ? 'added' : ''} ${addingToCart ? 'loading' : ''}`}
        onClick={handleAddToCart}
        disabled={addingToCart || isLoading || cartAdded}
      >
        {cartAdded ? (
          <>
            <span className='check-icon'>✓</span> Added to Cart
          </>
        ) : addingToCart ? (
          '⏳ Adding...'
        ) : (
          '🛒 Add to Cart'
        )}
      </button>

      {/* Info Icon */}
      <button
        className='info-button'
        onClick={(e) => {
          e.stopPropagation()
          onViewDetails(test.testCode)
        }}
        title='View full test details'
      >
        <FiInfo />
      </button>
    </div>
  )
}
