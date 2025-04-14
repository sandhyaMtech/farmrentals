import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // adjust if path is different

type Equipment = {
  id: string;
  title: string;
  description: string;
  price_per_day: number;
  image_url: string;
};

function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');

      if (error) {
        console.error('Error fetching equipment:', error);
      } else {
        setEquipment(data || []);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Available Equipment</h2>
      {equipment.map(item => (
        <div key={item.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p>₹{item.price_per_day} / day</p>
          <img src={item.image_url} alt={item.title} style={{ width: '200px', height: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

export default EquipmentList;