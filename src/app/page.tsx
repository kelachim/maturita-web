"use client"
import Image from "next/image"
import React, { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import type { Station } from '@prisma/client';
import { format } from 'date-fns'
import { cs } from "date-fns/locale";
import Link from "next/link";
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

const CLASSROOMS_KEY = '/api/classrooms';

const fetcher = (url: string) =>
  fetch(url, {
    method: 'GET',
  }).then((res) => res.json());

type Classroom = {
  stations: {
    id: string;
    name: string;
    classroomId: string | null;
  }[];
} & {
  id: string;
  name: string;
};

type DeviceResponse = {
  id: string;
  vendor_id: string;
  product_id: string;
  files: string[];
  description: string | null;
  serial_number: string | null;
  events: {
    userId: string;
    variation: string;
    createdAt: Date;
  }[];
};

const CreateClassroomDialog = ({ open, onOpenChange }) => {
  const [classroomName, setClassroomName] = useState('');
  const [selectedStations, setSelectedStations] = useState<Station[]>([]);
  const { data: stations, isLoading } = useSWR('/api/stations', fetcher);

  const handleCreateClassroom = async () => {
    try {
      const response = await fetch('/api/createClassroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: classroomName,
          stationIds: selectedStations.map((station) => station.id),
        }),
      });

      if (response.ok) {
        setClassroomName('');
        setSelectedStations([]);
        onOpenChange(false);
        // Revalidate the classrooms data
        mutate(CLASSROOMS_KEY);
      } else {
        const errorData = await response.json();
        console.error('Error creating classroom:', errorData.message);
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Create Classroom</Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Create a new classroom and select the stations to be part of it.
          </Dialog.Description>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="classroom-name">
              Classroom Name
            </label>
            <input
              className="Input outline-none text-black"
              id="classroom-name"
              onChange={(e) => setClassroomName(e.target.value)}
            />
          </fieldset>
          <div className="Fieldset">
            <span className="Label">Stations</span>
            {isLoading ? (
              'Loading...'
            ) : stations ? (
              <div className="flex flex-wrap gap-2">
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className={`bg-gray-800 text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-300 ${selectedStations.some((s) => s.id === station.id)
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'hover:bg-gray-700'
                      }`}
                    onClick={() => {
                      if (selectedStations.some((s) => s.id === station.id)) {
                        setSelectedStations(
                          selectedStations.filter((s) => s.id !== station.id)
                        );
                      } else {
                        setSelectedStations([...selectedStations, station]);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between space-x-3">
                      <span>{station.name}</span>
                      <a
                        href={`/database?tab=Station&id=${station.id}`}
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              'No stations found'
            )}
          </div>
          <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
            <Dialog.Close asChild>
              <button type="submit" className="Button bg-white" onClick={handleCreateClassroom}>
                Create Classroom
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button type="button" className="IconButton transition-all text-white" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const EditClassroomDialog = ({ open, onOpenChange, classroom }) => {
  const [classroomName, setClassroomName] = useState(classroom.name);
  const [selectedStations, setSelectedStations] = useState<Station[]>(classroom.stations);
  const { data: stations, isLoading } = useSWR('/api/stations', fetcher);

  const handleUpdateClassroom = async () => {
    try {
      const response = await fetch("/api/classrooms", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: classroomName,
          id: classroom.id,
          stationIds: selectedStations.map((station) => station.id) || [],
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        // Revalidate the classrooms data
        mutate(CLASSROOMS_KEY);
      } else {
        const errorData = await response.json();
        console.error('Error updating classroom:', errorData.message);
      }
    } catch (error) {
      console.error('Error updating classroom:', error);
    }
  };

  const handleDeleteClassroom = async () => {
    try {
      const response = await fetch(`/api/classrooms?classroomId=${classroom.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onOpenChange(false);
        // Revalidate the classrooms data
        mutate(CLASSROOMS_KEY);
      } else {
        const errorData = await response.json();
        console.error('Error deleting classroom:', errorData.message);
      }
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Edit Classroom</Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Update the classroom name and select the stations to be part of it.
          </Dialog.Description>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="classroom-name">
              Classroom Name
            </label>
            <input
              className="Input outline-none text-black"
              id="classroom-name"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
            />
          </fieldset>
          <div className="Fieldset">
            <span className="Label">Stations</span>
            {isLoading ? (
              'Loading...'
            ) : stations ? (
              <div className="flex flex-wrap gap-2">
                {stations.map((station) => (
                  <div
                    key={station.id}
                    className={`bg-gray-800 text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-300 ${selectedStations.some((s) => s.id === station.id)
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'hover:bg-gray-700'
                      }`}
                    onClick={() => {
                      if (selectedStations.some((s) => s.id === station.id)) {
                        setSelectedStations(
                          selectedStations.filter((s) => s.id !== station.id)
                        );
                      } else {
                        setSelectedStations([...selectedStations, station]);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3 justify-between">
                      <span>{station.name}</span>
                      <a
                        href={`/database?tab=Station&id=${station.id}`}
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              'No stations found'
            )}
          </div>
          <div style={{ display: 'flex', marginTop: 25, justifyContent: 'space-between' }}>
            <Dialog.Close asChild>
              <button type="button" className="Button text-white" onClick={handleDeleteClassroom}>
                Delete Classroom
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button type="submit" className="Button bg-white" onClick={handleUpdateClassroom}>
                Save Changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button type="button" className="IconButton transition-all text-white" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const App = () => {
  const [filename, setFilename] = useState("");
  const [isCreateClassroomDialogOpen, setIsCreateClassroomDialogOpen] = useState(false);
  const [isEditClassroomDialogOpen, setIsEditClassroomDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  const { data, isLoading, mutate } = useSWR(CLASSROOMS_KEY, fetcher);
  const { data: device } = useSWR(
    filename ? `/api/filesearch?filename=${filename}` : null,
    fetcher
  );

  const handleEditClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsEditClassroomDialogOpen(true);
  };

  return (
    <div className="h-screen text-2xl bg-[#131720] font-extralight text-white">
      <div className="flex items-center justify-between p-3 bg-[#0d1016] border-b-[#2d3547] border-b-1 text-white flex-col sm:flex-row">
        <div className='flex text-slate-600 gap-14 items-center justify-center'>
          <h1 className="text-xl text-slate-500">Usb Guard</h1>
          <div className="flex gap-3">
            <div className='cursor-pointer text-base'>Dashboard</div>
            <Link className="text-base" href="/database">Database</Link>
          </div>
        </div>
      </div>
      <div className='flex m-auto lg:w-2/3 flex-col gap-20 p-8 font-medium'>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="space-x-5">
              <div className='inline-block'>Classrooms</div>
              <button
                type="button"
                onClick={() => setIsCreateClassroomDialogOpen(true)}
                className='border-1 cursor-pointer text-sm border-slate-400 w-max p-1 rounded-md inline-block'
              >
                Create classroom
              </button>
            </div>
            <div className="text-sm flex flex-row gap-3 justify-between flex-wrap text-slate-400">
              {isLoading ?
                "Loading..."
                : data && data.length !== 0 ?
                  (data as Classroom[]).map((classroom) => (
                    <div
                      key={classroom.id}
                      className="p-2 rounded-md h-20 border-slate-400 border-1 md:w-[49%] w-full cursor-pointer"
                      onClick={() => handleEditClassroom(classroom)}
                    >
                      <span className="block">Name: {classroom.name}</span>
                      <span className="block">Computer count: {classroom.stations.length}</span>
                    </div>
                  ))
                  :
                  "Nothing is here yet"
              }
            </div>
          </div>
          <div className="flex gap-5 flex-col">
            <div>
              <span className="block">File search</span>
              <input type="text" placeholder="Put the filename here" onChange={e => setFilename(e.target.value)} className="w-full outline-none bg-slate-800 p-1 rounded-md text-sm" />
            </div>
            {device?.firstEvent ? (
              <div className="text-sm flex flex-col gap-2 text-slate-400">
                <div>
                  <span className="block">Last seen:</span>
                  <span className="block">User: {device?.firstEvent?.user}</span>
                  <span className="block">Variation: {device?.firstEvent?.variation}</span>
                  <span className="block">Last seen: {format(device?.firstEvent?.createdAt, "'in ' Pp", { locale: cs })}</span>
                </div>
                <Link className="p-1 border-1 border-slate-400 rounded-md w-max" href={`/database?tab=Event&id=${device?.firstEvent?.id}`}>
                  Go to the device in database
                </Link>
              </div>
            )
              : device?.message ?
                (
                  <div className="text-sm">{device?.message}</div>
                )
                :
                (
                  <></>
                )}
          </div>
        </div>
        {isCreateClassroomDialogOpen && (
          <CreateClassroomDialog
            open={isCreateClassroomDialogOpen}
            onOpenChange={setIsCreateClassroomDialogOpen}
            mutate={mutate}
          />
        )}
        {isEditClassroomDialogOpen && selectedClassroom && (
          <EditClassroomDialog
            open={isEditClassroomDialogOpen}
            onOpenChange={setIsEditClassroomDialogOpen}
            classroom={selectedClassroom}
            mutate={mutate}
          />
        )}
      </div>
    </div>
  );
};

export default App;