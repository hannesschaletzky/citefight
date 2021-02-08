import React from 'react';
import { useParams } from 'react-router-dom';
//import st from './Match.module.scss'

export default function Match() {
  const { id } = useParams<Record<string, string | undefined>>()

  return (
    <div>Matchroom with id {id}</div>
  );
}


