import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/logo.svg';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import api from '../../services/api';
import ibge from '../../services/ibge';
import Dropzone from '../../components/Dropzone';

import './styles.css';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUF {
  sigla: string;
}

interface IBGECity {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf,setSelectedUf] = useState<string>('0');
  const [selectedCity,setSelectedCity] = useState<string>('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedZoom, setSelectedZoom] = useState(15);
  const [selectedFile, setSelectedFile] = useState<File>();

  function handleSelectUf (event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }

  function handleSelectCity (event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick (event: LeafletMouseEvent ) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
    setSelectedZoom(event.target.zoom);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [event.target.name]: event.target.value})
  }

  function handleItemClick(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }
  const history = useHistory();

  async function handleSubmit (event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [ latitude, longitude ] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('city', city);
    data.append('uf', uf);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    
    if (selectedFile) {
      data.append('image',selectedFile);
    }

    await api.post('points', data).then(response => {
      alert('Ponto de Coleta Criado');
      history.push('/')
    }).catch(error => {
      console.log(error);
    });
  }

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, []);

  useEffect(() => {
    ibge.get<IBGEUF[]>('estados').then(response => {
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials);
    });
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setSelectedPosition([ position.coords.latitude, position.coords.longitude ])
    });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }
    ibge.get<IBGECity[]>(`estados/${selectedUf}/municipios`).then(response => {
      const cityNames = response.data.map(city => city.nome);
      setCities(cityNames);
    });
  }, [selectedUf]);

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input type="text" name="name" id="name" onChange={handleInputChange} />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input type="email" name="email" id="email" onChange={handleInputChange} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map 
            center={{
              lat: selectedPosition[0],
              lng: selectedPosition[1]
            }}
            zoom={selectedZoom}
            onClick={handleMapClick}
          >
            <TileLayer 
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={{
                lat: selectedPosition[0],
                lng: selectedPosition[1]
              }}
            />
          </Map>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={handleSelectUf} value={selectedUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid" >
            {items.map(item => (
              <li key={item.id} onClick={() => handleItemClick(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                <img src={item.image_url} alt=""/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar Ponto de Coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint;