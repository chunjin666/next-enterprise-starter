'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Home, CheckSquare } from 'lucide-react'
import { useAuth } from '@/presentation/context/auth-context'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Navigation items
  const navItems = [
    {
      href: '/dashboard',
      label: '仪表板',
      icon: Home,
      active: pathname === '/dashboard',
    },
    {
      href: '/todos',
      label: '待办事项',
      icon: CheckSquare,
      active: pathname.startsWith('/todos'),
    },
  ]

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-xl font-bold text-primary hover:text-primary/80 transition-colors duration-200"
            >
              Starter
            </Link>
            {user && (
              <>
                {/* Desktop Navigation */}
                <div className="hidden space-x-4 md:flex">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium hover:text-primary transition-colors duration-200 ${
                        item.active ? 'text-primary font-semibold' : 'text-foreground/80'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                      <div className="flex flex-col space-y-4 mt-8">
                        <div className="flex items-center space-x-2 pb-4 border-b">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                              {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="font-medium">{user.email}</p>
                            <p className="text-sm text-muted-foreground">用户</p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                  item.active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            )
                          })}
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex flex-col space-y-2">
                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href="/dashboard" className="flex flex-col items-start px-3 py-2">
                                <span>个人中心</span>
                                <span className="text-xs text-muted-foreground">管理您的账户和设置</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              账号管理
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleSignOut}
                              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              退出登录
                            </DropdownMenuItem>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <div className="flex flex-col">
                        <span>个人中心</span>
                        <span className="text-xs text-muted-foreground">管理您的账户和设置</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>账号管理</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>退出登录</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">注册</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
