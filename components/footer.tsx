import Link from "next/link"
import { Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Mandarin3D</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Custom 3D printing done right. Upload your design, get an instant quote. No middlemen, no minimums—just quality prints from Jacksonville, FL.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
              <li><Link href="/upload" className="hover:text-primary transition-colors">Upload</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:orders@mandarin3d.com" className="hover:text-primary transition-colors">orders@mandarin3d.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Jacksonville, FL</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Mandarin3D. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

