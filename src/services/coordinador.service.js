//Requisito 2: Acceso a información completa de alumnos en práctica
//El coordinador podrá acceder a toda la información relacionada con los alumnos en práctica, 
//incluyendo formularios, bitácoras, evaluaciones e informes. 
//Este acceso le permitirá hacer un seguimiento integral del progreso de cada estudiante. 
//Solo el coordinador autenticado podrá visualizar estos datos, garantizando así la privacidad 
//y trazabilidad de la información. Una vez consultados, los registros podrán ser descargados o 
//revisados directamente desde la plataforma.

import { AppDataSource } from "../config/configDB";
import { Alumno } from "../entities/Alumno";
