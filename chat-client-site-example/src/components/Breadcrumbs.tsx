import { Anchor, Breadcrumbs, em } from '@mantine/core';
import classes from '@/styles/components/Breadcrumbs.module.css'
import { useMediaQuery } from '@mantine/hooks';
interface BreadcrumbsLkProps {
    breadcrumbs?: { title: string, href: string }[]
}

const items = [
    { title: 'Главная', href: '/' },
    { title: 'Профиль', href: '/panel' },
    { title: 'Кабинет', href: '/panel' },
].map((item, index) => (
    <Anchor
        className={classes.breadcrumbsItem}
        fz='xss'
        fw={400}
        c='var(---color-secondary)'
        href={item.href}
        key={index}>
        {item.title}
    </Anchor>
))


export function BreadcrumbsLk(props: BreadcrumbsLkProps) {
    const HasBreadcrumbs = Array.isArray(props.breadcrumbs)
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`)



    const itemsBreadcrumbs = (HasBreadcrumbs ? props.breadcrumbs : [])?.map((item, index) => (
        <Anchor
            className={classes.breadcrumbsItem}
            fz='xss'
            fw={400}
            c='var(---color-secondary)'
            href={item.href}
            key={index}>
            {item.title}
        </Anchor>
    ))


    return (
        <>
            <Breadcrumbs
                className={isMobile ? classes.breadcrumbsMobile : classes.breadcrumbs}
                separator='|'
                separatorMargin='xs'
                color='var(---color-secondary)'
                c='var(---color-secondary)'
                mb={10}
            >
                {itemsBreadcrumbs}
            </Breadcrumbs>
        </>
    )
}