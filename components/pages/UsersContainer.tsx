'use client'
import React, { useState } from 'react'
import Menubar from './Menubar'
import UsersTable from './UsersTable'

const UsersContainer = () => {
  const [selectedFilter, setSeletedFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className='flex flex-col gap-5'>
        <Menubar setSeletedFilter={setSeletedFilter} searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        <UsersTable selectedFilter={selectedFilter} searchTerm={searchTerm}/>
    </div>
  )
}

export default UsersContainer