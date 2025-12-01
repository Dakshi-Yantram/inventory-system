import React from 'react'
import './stocks.css'
import { useState } from 'react'
import ComplteStock from './ComplteStock'
import RowMaterial from './RowMaterial'
import Semifinish from './Semifinish'
import FinishedGoods from './FinishedGoods'
import StationaryGoods from './StationaryGoods'
import { useLocation } from 'react-router'
import { NavLink } from 'react-router-dom'

let stocks = [
  {
    id: 1,
    title: 'Complete Stock',
    path: '/stock/completeStock',
    img: 'image div'
  },
  {
    id: 2,
    title: 'Raw Material',
    path: '/stock/rawMaterial',
    img: 'image div'
  },
  {
    id: 3,
    title: 'Semi finished goods',
    path: '/stock/semiGoods',
    img: 'image div'
  },
  {
    id: 4,
    title: 'finished goods',
    path: '/stock/finishedGoods',
    img: 'image div'
  },
  {
    id: 5,
    title: 'Stationary goods',
    path: '/stock/stationaryGoods',
    img: 'image div'
  }
]




function Stock(props) {
  const { ipAddress } = props
  const [pages, setPages] = useState(0)
  return (
    <div className='stock-container'>

      {pages === 1 ? <ComplteStock setPages={setPages} ipAddress={ipAddress} /> :
        pages === 2 ? <RowMaterial setPages={setPages} ipAddress={ipAddress} /> :
          pages === 3 ? <Semifinish setPages={setPages} ipAddress={ipAddress} /> :
            pages === 4 ? <FinishedGoods setPages={setPages} ipAddress={ipAddress} /> :
              pages === 5 ? <StationaryGoods setPages={setPages} ipAddress={ipAddress} /> : <div className='homeContainer'>
                {stocks.map((item) => {
                  return <div key={item.id}>
                    <NavLink to={item.path} className='navlink'>
                      <div className='stockItem' onClick={() => setPages(item.id)}>
                        <h1>{item.title}</h1>
                      </div>
                    </NavLink>
                  </div>
                })}
              </div>}

    </div>
  )
}

export default Stock
