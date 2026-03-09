'use client'

import { useAuth } from '@/presentation/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Layers, Zap, Shield, Activity } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  const features = [
    {
      icon: Layers,
      title: '四层架构',
      description: 'Clean Architecture + 轻量 DDD，清晰的分层与依赖方向',
    },
    {
      icon: Zap,
      title: 'tRPC + Server Actions',
      description: '类型安全的 API 调用，灵活的服务端交互方案',
    },
    {
      icon: Shield,
      title: 'Supabase Auth',
      description: '开箱即用的身份认证与 Row Level Security',
    },
    {
      icon: Activity,
      title: '可观测性',
      description: '统一的日志、追踪与错误处理机制',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Next Enterprise Starter</h1>
        <p className="text-xl text-muted-foreground mb-8">
          基于 Clean Architecture 的企业级 Next.js 全栈模板
        </p>
        <div className="flex justify-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg">进入仪表板</Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">开始使用</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">登录</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.title}>
              <CardHeader>
                <Icon className="h-8 w-8 mb-2 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
