'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { axiosInstance } from '@/src/utils/axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Loader from '../home/loader'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import OrdersToolbar from './shared/orders-toolbar'
import OrdersTable from './shared/orders-table'
import OrdersPagination from './shared/orders-pagination'
import {
    applyAdvancedFilters,
    emptyAdvancedFilters,
} from './shared/orders-filter-utils'
import { exportOrdersToExcel } from './shared/orders-export'
import { useOrdersSelection } from './shared/use-orders-selection'
import {
    OrdersContractStatusFilterBar,
    useOrdersContractStatusFilter,
} from './shared/use-orders-contract-status-filter'
import { useSidebarStore } from '@/src/stores/sidebar-store'

export default function CompletedOrdersWrapper() {
    const router = useRouter()
    const pathname = usePathname()
    const queryClient = useQueryClient()
    const { setDisplayedPart, setSidebarOpen } = useSidebarStore()
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState(emptyAdvancedFilters);
    const {
        selectedOrders,
        selectedCount,
        isSelected,
        toggle,
        togglePage,
        clear,
        getPageSelectionState,
    } = useOrdersSelection();

    const {
        activeFilter,
        setActiveFilter,
        statusItems,
        allTotal,
        countsById,
        statusLoading,
        countsLoading,
        appendStatusParam,
        resetStatusFilter,
        statusFilterReady,
    } = useOrdersContractStatusFilter({
        countsBaseUrl: "/admin/orders/complete/list",
    });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['unReceivedOrders'] });
        queryClient.invalidateQueries({ queryKey: ['unReceivedOrdersTotal'] });
        queryClient.invalidateQueries({ queryKey: ['order-status-count'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setSidebarOpen(true);
        setDisplayedPart('notification');
    }, [queryClient, setDisplayedPart, setSidebarOpen]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const searchParams = useSearchParams();
    const createdAtParam = searchParams ? searchParams.get('created_at') : null;

    const handleResetAll = () => {
        setSearchQuery('');
        setDebouncedSearchQuery('');
        setAdvancedFilters(emptyAdvancedFilters);
        setShowMoreFilters(false);
        resetStatusFilter();
        setCurrentPage(1);
        clear();
        if (createdAtParam) {
            router.replace(pathname);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, createdAtParam, activeFilter]);

    useEffect(() => {
        clear();
    }, [debouncedSearchQuery, createdAtParam, advancedFilters, activeFilter, clear]);

    /*-------------------------------------------------------------------------------------*/
    // get completed orders
    function getCompletedOrders() {
        let url = `/admin/orders/complete/list?page=${currentPage}`;
        if (createdAtParam) {
            const createAt = createdAtParam === 'total' ? 'all' : createdAtParam;
            url += `&created_at=${createAt}`;
        }
        if (debouncedSearchQuery) {
            url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
        }
        return axiosInstance(appendStatusParam(url));
    }
    const { data, isLoading } = useQuery({
        queryKey: ["completedOrders", createdAtParam, debouncedSearchQuery, currentPage, activeFilter],
        queryFn: getCompletedOrders,
        enabled: statusFilterReady,
    })
    const orders = data?.data?.data?.items ?? []
    const pagination = data?.data?.data?.pagination

    const filteredOrders = useMemo(
        () => applyAdvancedFilters(orders, advancedFilters, { showStatusColumn: true }),
        [orders, advancedFilters]
    )

    const exportConfig = useMemo(
        () => ({
            getSelectedOrders: () => selectedOrders,
            onExport: (rows) =>
                exportOrdersToExcel(rows, { filename: 'الطلبات-المكتملة', showStatusColumn: true }),
        }),
        [selectedOrders]
    );

    const pageSelectionState = getPageSelectionState(filteredOrders);

    /*-------------------------------------------------------------------------------------*/
    // loader
    if (isLoading || statusLoading || countsLoading) return <Loader />
    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <div className="flex flex-col gap-4 relative z-10">
                <OrdersContractStatusFilterBar
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    statusItems={statusItems}
                    countsById={countsById}
                    allTotal={allTotal}
                />
                <OrdersToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    showAddButtons
                    queryKeys={["completedOrders"]}
                    showMoreFilters={showMoreFilters}
                    onToggleMoreFilters={() => setShowMoreFilters((prev) => !prev)}
                    advancedFilters={advancedFilters}
                    onAdvancedFiltersChange={setAdvancedFilters}
                    onResetAll={handleResetAll}
                    showStatusField
                    quickLinksLimit={3}
                    exportConfig={exportConfig}
                    selectedCount={selectedCount}
                    onClearSelection={clear}
                />
            </div>

            <OrdersTable
                orders={filteredOrders}
                showStatusColumn
                showChangeStatus
                queryKey={["completedOrders"]}
                onRowClick={(row) => router.push(`/home/orders/${row.id}`)}
                selectable
                isSelected={isSelected}
                onToggleRow={toggle}
                onTogglePage={togglePage}
                pageSelectionState={pageSelectionState}
            />

            <OrdersPagination
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}
