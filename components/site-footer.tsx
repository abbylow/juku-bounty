import { ThemeToggle } from "@/components/theme/theme-toggle";

/*
  TODO: add links
  - social media
  - customer support 
  - terms and conditions
  - privacy policy 
  - faq
*/
export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © COPYRIGHT 2024 [INSERT COMPANY NAME HERE]
        </p>
        <ThemeToggle />
      </div>
    </footer>
  )
}
