import { useEffect, useState } from 'react';

import {Header} from '../../components/Header';
import api from '../../services/api';
import {Food} from '../../components/Food';
import {ModalAddFood} from '../../components/ModalAddFood';
import {ModalEditFood} from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodType {
  id: number;
  available: boolean;
  image: string;
  name: string;
  description: string;
  price: number;
}

export function Dashboard() {
  const [foods, setFoods] = useState<FoodType[]>([]);
  const [editingFood, setEditingFood] = useState({} as FoodType);
  const [modalOpen, setmodalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    api.get<FoodType[]>('/foods').then((response)=> {
      setFoods(response.data);
    });
  }, []);

  function handleAddFood(food: FoodType) {
    try {
      api.post('/foods', {
        ...food,
        available: true,
      }).then((response) => {
        setFoods((all) => [...all, response.data]);
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: FoodType) {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated: FoodType[] = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  function handleDeleteFood(id: number) {
    api.delete(`/foods/${id}`).then(() => {
      const foodsFiltered = foods.filter(food => food.id !== id);
      setFoods(foodsFiltered);
    });
  }

  function toggleModal() {
    setmodalOpen(!modalOpen);
  }

  function toggleEditModal() {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: FoodType) {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}