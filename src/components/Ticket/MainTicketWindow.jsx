import { Button, Transition } from '@headlessui/react'
import React from 'react'
import { IoMdAdd } from 'react-icons/io'
import Tabs from '../Tabs/Tabs'
import BoardView from './BoardView'
import Table from './Table'
import PaginationBar from './PaginadoTickets'

export const MainTicketWindow = () => {
  return (
    <Transition
      as="div"
      appear
      show
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      className=""
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          {/* <Title title={status ? `${status} Tasks` : "Tasks"} /> */}
          {!status && (
            <Button
              label="Create Task"
              icon={<IoMdAdd className="text-lg" />}
              className="flex flex-row-reverse gap-1 items-center bg-blue-800 hover:bg-blue-600 text-white rounded px-1"
            />
          )}
        </div>
        <Tabs tabs={TABS} setSelected={setSelected}>
          {selected === 0 ? (
            <BoardView tickets={tickets} />
          ) : (
            <div className="w-full">
              <Table tickets={tickets} />
            </div>
          )}
        </Tabs>
        {/* <AddTask open={open} setOpen={setOpen} /> */}
        {totalPages > 1 && (
          <PaginationBar
            currentPage={pagina}
            totalPages={totalPages}
            onPrev={prevPage}
            onNext={nextPage}
          />
        )}
      </div>
    </Transition>
  )
}
