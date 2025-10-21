import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FaqSection() {
  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-red-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">FAQ</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Find answers to common questions about the IPPIS platform and its features.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-red-200">
              <AccordionTrigger className="text-left font-medium">What is IPPIS and what does it do?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The Integrated Personnel and Payroll Information System (IPPIS) is a centralized database system that
                manages the payment of salaries and wages directly to government employees' bank accounts with
                appropriate deductions and remittances of third-party payments. It ensures accuracy, transparency, and
                accountability in government payroll management.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-red-200">
              <AccordionTrigger className="text-left font-medium">
                How do I register on the IPPIS platform?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Registration on IPPIS is typically coordinated through your department or agency's HR unit. They will
                provide you with the necessary forms and guide you through the biometric capture process. Once your
                information is verified, you will be enrolled in the system and provided with login credentials.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-red-200">
              <AccordionTrigger className="text-left font-medium">
                I've forgotten my IPPIS number. How can I retrieve it?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                If you've forgotten your IPPIS number, you can contact your department's HR unit or the IPPIS help desk.
                Alternatively, you can use the "Forgot IPPIS Number" feature on the login page by providing your
                registered email address or phone number for verification.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-red-200">
              <AccordionTrigger className="text-left font-medium">
                How can I update my personal information in IPPIS?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                To update your personal information such as address, phone number, or next of kin, log in to your IPPIS
                account and navigate to the "Personal Information" section. Make the necessary changes and submit for
                approval. Note that some changes may require supporting documentation and verification by your HR
                department.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border-red-200">
              <AccordionTrigger className="text-left font-medium">
                When are salaries processed through IPPIS?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                IPPIS typically processes salaries between the 20th and 25th of each month. However, the actual payment
                date may vary depending on government disbursement schedules and bank processing times. Employees
                usually receive their salaries by the end of the month.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6" className="border-red-200">
              <AccordionTrigger className="text-left font-medium">
                How do I change my bank account details in IPPIS?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                To change your bank account details, you need to submit a formal request through your department's HR
                unit along with supporting documentation from your new bank. This change requires verification and
                approval to ensure security and prevent fraud.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7" className="border-red-200">
              <AccordionTrigger className="text-left font-medium">
                What should I do if my salary is incorrect or missing?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                If you notice discrepancies in your salary or if your payment is missing, first check your payslip
                details on the IPPIS portal. If there's an issue, contact your department's finance or HR unit
                immediately. They will investigate and escalate to the IPPIS help desk if necessary.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
