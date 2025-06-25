import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({
    items,
}: {
    items: NavItem[]
}) {
    const { url } = usePage();

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 font-medium px-2">
                Menu Utama
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = url.startsWith(item.href);
                    
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                asChild 
                                isActive={isActive}
                                tooltip={item.title}
                            >
                                <Link href={item.href} className="flex items-center gap-3">
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
