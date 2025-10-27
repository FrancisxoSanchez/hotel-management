// src/components/StripePaymentForm.tsx

"use client"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"

interface StripePaymentFormProps {
  totalPrice: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export default function StripePaymentForm({ 
  totalPrice, 
  onSuccess, 
  onError 
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage("")

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/cliente/mis-reservas`,
        },
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "Error al procesar el pago")
        onError(error.message || "Error al procesar el pago")
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id)
      } else {
        setErrorMessage("El pago no pudo ser procesado")
        onError("El pago no pudo ser procesado")
        setIsProcessing(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Error inesperado")
      onError(err.message || "Error inesperado")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Pago seguro procesado por Stripe</span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar ${totalPrice.toLocaleString('es-AR')}
          </>
        )}
      </Button>
    </form>
  )
}